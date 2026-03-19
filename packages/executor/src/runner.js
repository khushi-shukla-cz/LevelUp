// packages/executor/src/runner.js
// Executes user code inside isolated Docker containers.
// Each test case gets a fresh container — no shared state between runs.

const Docker = require('dockerode');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

// ─── Language configs ─────────────────────────────────────────────────────────
const LANG_CONFIG = {
  PYTHON: {
    image: 'python:3.11-alpine',
    filename: 'solution.py',
    cmd: (filename) => ['python3', '-u', filename],
    compileCmd: null, // interpreted
  },
  JAVA: {
    image: 'openjdk:17-alpine',
    filename: 'Solution.java',
    // Java: compile then run
    cmd: (filename) => ['sh', '-c', 'javac Solution.java && java -Xmx100m Solution'],
    compileCmd: null, // handled inline
  },
};

// ─── Pull image if not present ────────────────────────────────────────────────
const pulledImages = new Set();

async function ensureImage(image) {
  if (pulledImages.has(image)) return;
  try {
    await docker.getImage(image).inspect();
    pulledImages.add(image);
  } catch {
    logger.info(`Pulling Docker image: ${image}`);
    await new Promise((resolve, reject) => {
      docker.pull(image, (err, stream) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, (err) => {
          if (err) return reject(err);
          pulledImages.add(image);
          logger.info(`Image ready: ${image}`);
          resolve();
        });
      });
    });
  }
}

// ─── Run code against a single input ─────────────────────────────────────────
async function runInContainer({ execId, code, language, input, timeoutMs, memoryMb }) {
  const config = LANG_CONFIG[language];
  if (!config) throw new Error(`Unsupported language: ${language}`);

  await ensureImage(config.image);

  // Write code to temp dir
  const tmpDir = path.join(os.tmpdir(), 'levelup', execId);
  fs.mkdirSync(tmpDir, { recursive: true });
  fs.writeFileSync(path.join(tmpDir, config.filename), code, 'utf8');

  // Write stdin
  const stdinPath = path.join(tmpDir, 'stdin.txt');
  fs.writeFileSync(stdinPath, input || '', 'utf8');

  let container;
  const startTime = Date.now();

  try {
    container = await docker.createContainer({
      Image: config.image,
      Cmd: config.cmd(config.filename),
      WorkingDir: '/code',
      AttachStdout: true,
      AttachStderr: true,
      OpenStdin: true,
      StdinOnce: true,
      NetworkDisabled: true, // No network access
      HostConfig: {
        Memory: memoryMb * 1024 * 1024,
        MemorySwap: memoryMb * 1024 * 1024,
        CpuPeriod: 100000,
        CpuQuota: 50000,         // 50% of one CPU
        PidsLimit: 50,           // max 50 processes
        ReadonlyRootfs: false,   // needs write for javac
        AutoRemove: false,
        Binds: [`${tmpDir}:/code`],
        SecurityOpt: ['no-new-privileges'],
      }
    });

    await container.start();

    // Feed stdin
    const stdinStream = await container.attach({ stream: true, stdin: true, stdout: false, stderr: false });
    stdinStream.write(input || '');
    stdinStream.end();

    // Collect output with timeout
    let stdout = '';
    let stderr = '';

    const outputStream = await container.attach({ stream: true, stdin: false, stdout: true, stderr: true, logs: true });

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Time limit exceeded'));
      }, timeoutMs);

      container.modem.demuxStream(outputStream, {
        write: (chunk) => { stdout += chunk.toString(); }
      }, {
        write: (chunk) => { stderr += chunk.toString(); }
      });

      outputStream.on('end', () => { clearTimeout(timeout); resolve(); });
      outputStream.on('error', (e) => { clearTimeout(timeout); reject(e); });
    });

    const runtime = Date.now() - startTime;
    return { stdout: stdout.trim(), stderr: stderr.trim(), runtime, timedOut: false };

  } catch (err) {
    const runtime = Date.now() - startTime;
    if (err.message === 'Time limit exceeded') {
      return { stdout: '', stderr: 'Time limit exceeded', runtime, timedOut: true };
    }
    return { stdout: '', stderr: err.message, runtime, timedOut: false };
  } finally {
    // Cleanup container
    if (container) {
      try {
        await container.stop({ t: 0 }).catch(() => {});
        await container.remove({ force: true }).catch(() => {});
      } catch { /* already removed */ }
    }
    // Cleanup tmpDir
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { }
  }
}

// ─── Run against multiple test cases ─────────────────────────────────────────
async function runWithTestCases({ execId, code, language, testCases, timeoutMs, memoryMb }) {
  const results = [];
  let totalRuntime = 0;
  let passed = 0;

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const caseExecId = `${execId}-tc${i}`;

    const { stdout, stderr, runtime, timedOut } = await runInContainer({
      execId: caseExecId,
      code,
      language,
      input: tc.input || '',
      timeoutMs,
      memoryMb,
    });

    totalRuntime += runtime;

    const actualOutput = stdout.trim();
    const expectedOutput = (tc.expectedOutput || '').trim();
    const isCorrect = !timedOut && !stderr && actualOutput === expectedOutput;

    if (isCorrect) passed++;

    results.push({
      testCase: i + 1,
      passed: isCorrect,
      input: tc.input,
      expectedOutput,
      actualOutput,
      runtime,
      errorMessage: timedOut ? 'Time limit exceeded' : (stderr || null),
    });

    // Short-circuit on compile error (first test case)
    if (i === 0 && stderr && (
      stderr.includes('SyntaxError') ||
      stderr.includes('error:') ||
      stderr.includes('Exception in thread')
    )) {
      // Fill remaining test cases as failed
      for (let j = i + 1; j < testCases.length; j++) {
        results.push({
          testCase: j + 1, passed: false,
          input: testCases[j].input,
          expectedOutput: testCases[j].expectedOutput,
          actualOutput: '',
          runtime: 0,
          errorMessage: 'Compile error — previous test case failed',
        });
      }
      break;
    }
  }

  const errorMessage = results.find(r => r.errorMessage && !results.find(r2 => r2.passed))?.errorMessage || null;

  return {
    passed,
    total: testCases.length,
    results,
    runtime: totalRuntime,
    output: results[0]?.actualOutput || '',
    errorMessage,
  };
}

// ─── Run single (REPL-style, no test case matching) ──────────────────────────
async function runSingle({ execId, code, language, input, timeoutMs, memoryMb }) {
  const { stdout, stderr, runtime, timedOut } = await runInContainer({
    execId, code, language, input, timeoutMs, memoryMb
  });
  return {
    output: stdout,
    error: timedOut ? 'Time limit exceeded' : stderr,
    runtime,
    timedOut,
  };
}

module.exports = { runWithTestCases, runSingle };
