const test = require('node:test');
const assert = require('node:assert/strict');

const makeMocks = (axiosImpl) => {
  const mockPrisma = {
    problem: { findUnique: async ({ where }) => ({
      id: where.id,
      type: 'CODING',
      testCases: JSON.stringify([{ input: '1', expectedOutput: '1' }]),
      xpReward: 100,
      title: 'Sample Problem',
      difficulty: 'EASY',
    })},
    submission: {
      create: async ({ data }) => ({ id: 99, ...data }),
      update: async ({ where, data }) => ({ id: where.id, ...data }),
      count: async () => 0,
    },
    user: {
      findUnique: async ({ where }) => ({ id: where.id, xp: 0, level: 1, coins: 0, streak: 0, lastActiveDate: null }),
      update: async ({ where, data }) => ({ id: where.id, ...data }),
    },
    leaderboardEntry: { upsert: async () => ({}) },
    $transaction: async (arr) => Promise.all(arr.map((p) => p)),
  };

  const mockXp = {
    awardXP: async (userId, xpAmount) => ({ xpGained: xpAmount, totalXP: 1000, level: 1, leveledUp: false, oldLevel: 1 }),
    awardCoins: async () => ({ coins: 10 }),
    updateStreak: async () => ({ streak: 1, extended: true }),
    calculateXPReward: () => 100,
  };

  // Inject into require cache
  const prismaPath = require.resolve('../src/services/prisma');
  require.cache[prismaPath] = { id: prismaPath, filename: prismaPath, loaded: true, exports: mockPrisma };
  const xpPath = require.resolve('../src/services/xpEngine');
  require.cache[xpPath] = { id: xpPath, filename: xpPath, loaded: true, exports: mockXp };
  const loggerPath = require.resolve('../src/services/logger');
  require.cache[loggerPath] = { id: loggerPath, filename: loggerPath, loaded: true, exports: { error: () => {}, info: () => {}, debug: () => {} } };
  const axiosPath = require.resolve('axios');
  require.cache[axiosPath] = { id: axiosPath, filename: axiosPath, loaded: true, exports: axiosImpl };
};

test('executor unavailable returns 502 and sets runtime error', async () => {
  makeMocks({ post: async () => { throw new Error('ECONNREFUSED'); } });
  const { submitCode } = require('../src/controllers/submissions.controller');

  const req = { body: { problemId: 1, code: 'print(1)', language: 'PYTHON' }, user: { id: 7, streak: 0 } };
  let responseBody;
  const res = { status(code) { this.statusCode = code; return this; }, json(obj) { responseBody = obj; return obj; } };
  const next = (err) => { throw err; };

  await submitCode(req, res, next);
  assert.equal(res.statusCode, 502);
  assert(responseBody.error && responseBody.error.includes('Code execution service unavailable'));
});

test('compile-like executor result maps to COMPILE_ERROR', async () => {
  makeMocks({ post: async () => ({ data: { passed: 0, total: 1, runtime: 0, results: [], output: null, errorMessage: 'SyntaxError: invalid syntax' } }) });
  delete require.cache[require.resolve('../src/controllers/submissions.controller')];
  const { submitCode } = require('../src/controllers/submissions.controller');

  const req = { body: { problemId: 1, code: 'bad code', language: 'PYTHON' }, user: { id: 7, streak: 0 } };
  let responseBody;
  const res = { status(code) { this.statusCode = code; return this; }, json(obj) { responseBody = obj; return obj; } };
  const next = (err) => { throw err; };

  await submitCode(req, res, next);
  assert(responseBody.submission);
  assert.equal(responseBody.submission.result, 'COMPILE_ERROR');
});

test('no error but failing tests maps to WRONG_ANSWER', async () => {
  makeMocks({ post: async () => ({ data: { passed: 0, total: 1, runtime: 5, results: [{ passed: false }], output: '0', errorMessage: null } }) });
  delete require.cache[require.resolve('../src/controllers/submissions.controller')];
  const { submitCode } = require('../src/controllers/submissions.controller');

  const req = { body: { problemId: 1, code: 'print(0)', language: 'PYTHON' }, user: { id: 7, streak: 0 } };
  let responseBody;
  const res = { status(code) { this.statusCode = code; return this; }, json(obj) { responseBody = obj; return obj; } };
  const next = (err) => { throw err; };

  await submitCode(req, res, next);
  assert(responseBody.submission);
  assert.equal(responseBody.submission.result, 'WRONG_ANSWER');
});
