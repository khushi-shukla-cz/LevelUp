// packages/server/src/controllers/submissions.controller.js
const axios = require('axios');
const prisma = require('../services/prisma');
const { awardXP, awardCoins, updateStreak, calculateXPReward } = require('../services/xpEngine');
const logger = require('../services/logger');

const EXECUTOR_URL = process.env.EXECUTOR_URL || 'http://localhost:5000';

// POST /api/submissions
const submitCode = async (req, res, next) => {
  try {
    const { problemId, code, language } = req.body;
    const userId = req.user.id;

    // Validate language
    if (!['PYTHON', 'JAVA'].includes(language?.toUpperCase())) {
      return res.status(400).json({ error: 'Unsupported language. Use PYTHON or JAVA.' });
    }

    const problem = await prisma.problem.findUnique({ where: { id: problemId } });
    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    // Only coding/debugging problems go through executor
    if (!['CODING', 'DEBUGGING'].includes(problem.type)) {
      return res.status(400).json({ error: 'Use /api/submissions/mcq for MCQ problems' });
    }

    const testCases = JSON.parse(problem.testCases || '[]');
    if (!testCases.length) {
      return res.status(400).json({ error: 'No test cases available for this problem' });
    }

    // Create pending submission
    const submission = await prisma.submission.create({
      data: {
        userId,
        problemId,
        code,
        language: language.toUpperCase(),
        result: 'PENDING',
        testsTotal: testCases.length,
      }
    });

    // Send to executor microservice
    let executionResult;
    try {
      const response = await axios.post(`${EXECUTOR_URL}/execute`, {
        code,
        language: language.toUpperCase(),
        testCases: testCases.map(tc => ({ input: tc.input, expectedOutput: tc.expectedOutput })),
        timeoutMs: 10000,
        memoryMb: 128,
      }, { timeout: 30000 });

      executionResult = response.data;
    } catch (execErr) {
      logger.error('Executor service error:', execErr.message);
      await prisma.submission.update({
        where: { id: submission.id },
        data: { result: 'RUNTIME_ERROR', errorMessage: 'Execution service unavailable' }
      });
      return res.status(502).json({ error: 'Code execution service unavailable. Please try again.' });
    }

    // Process results
    const { passed, total, runtime, errorMessage, output, results } = executionResult;
    const allPassed = passed === total;
    const result = allPassed ? 'ACCEPTED'
      : errorMessage?.includes('Time limit') ? 'TIME_LIMIT'
      : errorMessage?.includes('compile') || errorMessage?.includes('SyntaxError') ? 'COMPILE_ERROR'
      : errorMessage ? 'RUNTIME_ERROR'
      : 'WRONG_ANSWER';

    // Update submission
    const updatedSubmission = await prisma.submission.update({
      where: { id: submission.id },
      data: {
        result,
        runtime,
        testsPassed: passed,
        testsTotal: total,
        errorMessage: errorMessage || null,
        output: output || null,
      }
    });

    // Award XP + coins if accepted (first time only)
    let xpResult = null;
    let streakResult = null;
    let alreadySolved = false;

    if (allPassed) {
      const previousAccepted = await prisma.submission.count({
        where: { userId, problemId, result: 'ACCEPTED', id: { not: submission.id } }
      });
      alreadySolved = previousAccepted > 0;

      if (!alreadySolved) {
        const xpToAward = calculateXPReward({
          baseXP: problem.xpReward,
          difficulty: problem.difficulty,
          streak: req.user.streak,
        });
        const coinReward = Math.floor(problem.xpReward * 0.1);

        xpResult = await awardXP(userId, xpToAward, `Solved: ${problem.title}`);
        await awardCoins(userId, coinReward);
        streakResult = await updateStreak(userId);
      }
    }

    res.json({
      submission: updatedSubmission,
      results,
      xpResult,
      streakResult,
      alreadySolved,
      summary: {
        result,
        passed,
        total,
        runtime,
        errorMessage,
      }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/submissions/mcq
const submitMCQ = async (req, res, next) => {
  try {
    const { problemId, selectedOption } = req.body;
    const userId = req.user.id;

    const problem = await prisma.problem.findUnique({ where: { id: problemId } });
    if (!problem || problem.type !== 'MCQ') {
      return res.status(400).json({ error: 'Invalid MCQ problem' });
    }

    const options = JSON.parse(problem.mcqOptions || '[]');
    const correct = options.find(o => o.isCorrect);
    const isCorrect = correct?.id === selectedOption;

    const result = isCorrect ? 'ACCEPTED' : 'WRONG_ANSWER';

    const submission = await prisma.submission.create({
      data: {
        userId, problemId,
        code: selectedOption,
        language: 'PYTHON', // placeholder for MCQ
        result,
        testsPassed: isCorrect ? 1 : 0,
        testsTotal: 1,
      }
    });

    let xpResult = null;
    if (isCorrect) {
      const prevAccepted = await prisma.submission.count({
        where: { userId, problemId, result: 'ACCEPTED', id: { not: submission.id } }
      });
      if (!prevAccepted) {
        xpResult = await awardXP(userId, problem.xpReward, `MCQ: ${problem.title}`);
        await updateStreak(userId);
      }
    }

    res.json({
      submission,
      isCorrect,
      correctOption: correct?.id,
      explanation: problem.mcqExplanation,
      xpResult,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/submissions?problemId=&page=
const getUserSubmissions = async (req, res, next) => {
  try {
    const { problemId, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { userId: req.user.id };
    if (problemId) where.problemId = problemId;

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip,
        include: {
          problem: { select: { title: true, slug: true, difficulty: true, type: true } }
        }
      }),
      prisma.submission.count({ where })
    ]);

    res.json({ submissions, pagination: { page: parseInt(page), total } });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitCode, submitMCQ, getUserSubmissions };
