const test = require('node:test');
const assert = require('node:assert/strict');

const {
  classifyTestCaseResult,
  isCompileErrorMessage,
} = require('../src/runner');

test('classifyTestCaseResult normalizes matching output', () => {
  const result = classifyTestCaseResult({
    stdout: ' 42\n',
    stderr: '',
    timedOut: false,
    expectedOutput: '42',
  });

  assert.equal(result.passed, true);
  assert.equal(result.actualOutput, '42');
  assert.equal(result.expectedOutput, '42');
  assert.equal(result.errorMessage, null);
});

test('classifyTestCaseResult surfaces timeouts and stderr', () => {
  const result = classifyTestCaseResult({
    stdout: '',
    stderr: 'runtime failure',
    timedOut: false,
    expectedOutput: '0',
  });

  assert.equal(result.passed, false);
  assert.equal(result.errorMessage, 'runtime failure');
});

test('isCompileErrorMessage catches common compiler failures', () => {
  assert.equal(isCompileErrorMessage('Compile error — previous test case failed'), true);
  assert.equal(isCompileErrorMessage('SyntaxError: invalid syntax'), true);
  assert.equal(isCompileErrorMessage('runtime failure'), false);
});