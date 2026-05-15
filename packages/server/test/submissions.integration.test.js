const test = require('node:test');
const assert = require('node:assert/strict');

test('submitCode accepted flow awards XP and returns accepted', async () => {
  // Mock Prisma methods used by the controller
  const mockPrisma = {
    problem: {
      findUnique: async ({ where }) => ({
        id: where.id,
        type: 'CODING',
        testCases: JSON.stringify([{ input: '1', expectedOutput: '1' }]),
        xpReward: 100,
        title: 'Sample Problem',
        difficulty: 'EASY',
      }),
    },
    submission: {
      create: async ({ data }) => ({ id: 42, ...data }),
      update: async ({ where, data }) => ({ id: where.id, ...data }),
      count: async ({ where }) => 0,
    },
    user: {
      findUnique: async ({ where }) => ({ id: where.id, xp: 0, level: 1, coins: 0, streak: 0, lastActiveDate: null }),
      update: async ({ where, data }) => ({ id: where.id, ...data }),
    },
    leaderboardEntry: {
      upsert: async () => ({}),
    },
    $transaction: async (arr) => Promise.all(arr.map((p) => p)),
  };

  // Inject mocked modules before requiring the controller
  const prismaPath = require.resolve('../src/services/prisma');
  require.cache[prismaPath] = { id: prismaPath, filename: prismaPath, loaded: true, exports: mockPrisma };

  const mockXp = {
    awardXP: async (userId, xpAmount) => ({ xpGained: xpAmount, totalXP: 1000, level: 1, leveledUp: false, oldLevel: 1 }),
    awardCoins: async () => ({ coins: 10 }),
    updateStreak: async () => ({ streak: 1, extended: true }),
    calculateXPReward: () => 100,
  };
  const xpPath = require.resolve('../src/services/xpEngine');
  require.cache[xpPath] = { id: xpPath, filename: xpPath, loaded: true, exports: mockXp };

  const loggerPath = require.resolve('../src/services/logger');
  require.cache[loggerPath] = { id: loggerPath, filename: loggerPath, loaded: true, exports: { error: () => {}, info: () => {}, debug: () => {} } };

  // Mock axios to simulate executor response
  const axiosPath = require.resolve('axios');
  require.cache[axiosPath] = {
    id: axiosPath,
    filename: axiosPath,
    loaded: true,
    exports: {
      post: async () => ({ data: { passed: 1, total: 1, runtime: 10, results: [{ passed: true }], output: '1', errorMessage: null } }),
    },
  };

  // Now require the controller after mocks are in place
  const { submitCode } = require('../src/controllers/submissions.controller');

  const req = { body: { problemId: 1, code: 'print(1)', language: 'PYTHON' }, user: { id: 7, streak: 0 } };
  let responseBody;
  const res = {
    status(code) { this.statusCode = code; return this; },
    json(obj) { responseBody = obj; return obj; },
  };
  const next = (err) => { throw err; };

  await submitCode(req, res, next);

  assert(responseBody, 'expected a JSON response');
  assert.equal(responseBody.submission.result, 'ACCEPTED');
  assert(responseBody.xpResult, 'expected xpResult to be returned');
});
