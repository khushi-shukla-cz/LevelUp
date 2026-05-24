import assert from 'assert';
import axios from 'axios';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:4000';

function uniqueEmail() {
  return `e2e+${Date.now()}@levelup.test`;
}

describe('Full submission flow', () => {
  it('registers, logs in, submits code and receives ACCEPTED', async () => {
    const email = uniqueEmail();
    const password = 'password123';

    // Register
    const reg = await axios.post(`${SERVER_URL}/api/auth/register`, {
      name: 'E2E Submitter',
      email,
      password,
    }, { timeout: 10000 });
    assert.strictEqual(reg.status, 200);

    // Login
    const login = await axios.post(`${SERVER_URL}/api/auth/login`, { email, password }, { timeout: 10000 });
    assert.strictEqual(login.status, 200);
    const token = login.data.token || login.data.accessToken || login.data.jwt;
    assert.ok(token, 'login returned token');

    // Fetch problem by slug
    const probRes = await axios.get(`${SERVER_URL}/api/problems/hello-engineer`, { timeout: 10000 });
    assert.strictEqual(probRes.status, 200);
    const problem = probRes.data.problem;
    assert.strictEqual(problem.slug, 'hello-engineer');

    // Submit code (Python solution)
    const code = 'print("Hello, Engineer!")';
    const sub = await axios.post(`${SERVER_URL}/api/submissions`, {
      problemId: problem.id,
      code,
      language: 'PYTHON'
    }, { headers: { Authorization: `Bearer ${token}` }, timeout: 60000 });

    assert.strictEqual(sub.status, 200);
    const submission = sub.data.submission || sub.data;
    // Expect an ACCEPTED result and at least one passed test
    const summary = sub.data.summary || {};
    assert.ok(['ACCEPTED','ACCEPTED_WITH_WARNINGS'].includes(submission.result || summary.result || ''), 'submission accepted');
    assert.ok((summary.passed || submission.testsPassed || 0) >= 1, 'at least one test passed');
  });
});
