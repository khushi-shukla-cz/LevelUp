const test = require('node:test');
const assert = require('node:assert/strict');

const {
  xpForLevel,
  totalXPForLevel,
  levelFromXP,
  calculateXPReward,
} = require('../src/services/xpEngine');

test('xpForLevel follows the configured curve', () => {
  assert.equal(xpForLevel(1), 100);
  assert.equal(xpForLevel(5), 1118);
  assert.equal(xpForLevel(10), 3162);
});

test('totalXPForLevel accumulates prior level requirements', () => {
  assert.equal(totalXPForLevel(1), 0);
  assert.equal(totalXPForLevel(5), 1701);
  assert.equal(totalXPForLevel(10), 11102);
});

test('levelFromXP returns the highest unlocked level', () => {
  assert.equal(levelFromXP(0), 1);
  assert.equal(levelFromXP(99), 1);
  assert.equal(levelFromXP(100), 2);
  assert.equal(levelFromXP(1700), 4);
  assert.equal(levelFromXP(1701), 5);
  assert.equal(levelFromXP(2818), 5);
  assert.equal(levelFromXP(2819), 6);
});

test('calculateXPReward applies difficulty and streak multipliers', () => {
  assert.equal(calculateXPReward({ baseXP: 100, difficulty: 'EASY', streak: 0 }), 100);
  assert.equal(calculateXPReward({ baseXP: 100, difficulty: 'HARD', streak: 7 }), 300);
  assert.equal(calculateXPReward({ baseXP: 80, difficulty: 'BOSS', streak: 30 }), 480);
});