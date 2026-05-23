// packages/executor/src/index.js
require('dotenv').config();
let Sentry;
if (process.env.SENTRY_DSN) {
  try {
    Sentry = require('@sentry/node');
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      release: process.env.SENTRY_RELEASE || process.env.GITHUB_SHA,
      tracesSampleRate: 0.0,
    });
  } catch (e) {
    Sentry = null;
  }
}
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const runner = require('./runner');
const logger = require('./logger');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.SERVER_URL || 'http://server:4000' }));
app.use(express.json({ limit: '1mb' }));

// Strict rate limit — code execution is expensive
const execLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Execution rate limit exceeded. Wait 1 minute.' }
});

// ─── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'levelup-executor', timestamp: new Date().toISOString() });
});

// ─── Execute ──────────────────────────────────────────────────────────────────
// POST /execute
// Body: { code, language, testCases: [{input, expectedOutput}], timeoutMs, memoryMb }
app.post('/execute', execLimiter, async (req, res) => {
  const execId = uuidv4().slice(0, 8);
  const { code, language, testCases = [], timeoutMs = 10000, memoryMb = 128 } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: 'code and language are required' });
  }

  const lang = language.toUpperCase();
  if (!['PYTHON', 'JAVA'].includes(lang)) {
    return res.status(400).json({ error: 'Unsupported language. Use PYTHON or JAVA.' });
  }

  if (testCases.length === 0) {
    return res.status(400).json({ error: 'At least one test case required' });
  }

  logger.info(`[${execId}] Executing ${lang} — ${testCases.length} test(s)`);

  try {
    const result = await runner.runWithTestCases({
      execId,
      code,
      language: lang,
      testCases,
      timeoutMs: Math.min(timeoutMs, 15000), // hard cap at 15s
      memoryMb: Math.min(memoryMb, 256),      // hard cap at 256MB
    });

    logger.info(`[${execId}] Done — ${result.passed}/${result.total} passed`);
    res.json(result);
  } catch (err) {
    logger.error(`[${execId}] Execution error: ${err.message}`);
    if (Sentry) {
      try { Sentry.captureException(err); } catch (e) { /* ignore */ }
    }
    res.status(500).json({
      passed: 0,
      total: testCases.length,
      results: [],
      errorMessage: err.message,
      runtime: 0,
    });
  }
});

// ─── Run single (for testing) ─────────────────────────────────────────────────
app.post('/run', execLimiter, async (req, res) => {
  const { code, language, input = '' } = req.body;
  if (!code || !language) return res.status(400).json({ error: 'code and language required' });

  try {
    const result = await runner.runSingle({
      execId: uuidv4().slice(0, 8),
      code,
      language: language.toUpperCase(),
      input,
      timeoutMs: 10000,
      memoryMb: 128,
    });
    res.json(result);
  } catch (err) {
    if (Sentry) {
      try { Sentry.captureException(err); } catch (e) { /* ignore */ }
    }
    res.status(500).json({ error: err.message, output: '' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`⚡ Executor service running on port ${PORT}`);
});

if (Sentry) {
  process.on('unhandledRejection', (reason) => {
    try { Sentry.captureException(reason); } catch (e) { /* ignore */ }
  });
  process.on('uncaughtException', (err) => {
    try { Sentry.captureException(err); } catch (e) { /* ignore */ }
    // allow process to crash after reporting
    setTimeout(() => process.exit(1), 1000);
  });
}
