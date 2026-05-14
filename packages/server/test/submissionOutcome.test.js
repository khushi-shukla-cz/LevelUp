const test = require('node:test');
const assert = require('node:assert/strict');

const { determineSubmissionResult } = require('../src/services/submissionOutcome');

test('classifies successful submissions as accepted', () => {
  assert.equal(determineSubmissionResult({ passed: 3, total: 3, errorMessage: null }), 'ACCEPTED');
});

test('classifies timeouts before generic runtime failures', () => {
  assert.equal(determineSubmissionResult({ passed: 0, total: 3, errorMessage: 'Time limit exceeded' }), 'TIME_LIMIT');
});

test('classifies compile-like errors case-insensitively', () => {
  assert.equal(determineSubmissionResult({ passed: 0, total: 3, errorMessage: 'Compile error — previous test case failed' }), 'COMPILE_ERROR');
  assert.equal(determineSubmissionResult({ passed: 0, total: 3, errorMessage: 'SyntaxError: invalid syntax' }), 'COMPILE_ERROR');
});

test('falls back to runtime error or wrong answer', () => {
  assert.equal(determineSubmissionResult({ passed: 1, total: 3, errorMessage: 'Division by zero' }), 'RUNTIME_ERROR');
  assert.equal(determineSubmissionResult({ passed: 1, total: 3, errorMessage: null }), 'WRONG_ANSWER');
});