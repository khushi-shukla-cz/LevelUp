import assert from 'assert';
import axios from 'axios';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:4000';

function uniqueEmail() {
  return `e2e+${Date.now()}@levelup.test`;
}

describe('E2E auth flow', () => {
  it('register -> login -> getMe', async () => {
    const email = uniqueEmail();
    const password = 'password123';

    // register
    const reg = await axios.post(`${SERVER_URL}/api/auth/register`, {
      name: 'E2E Tester',
      email,
      password,
    }, { timeout: 5000 });
    assert.strictEqual(reg.status, 200);
    assert.ok(reg.data.id || reg.data.email, 'registration returned user');

    // login
    const login = await axios.post(`${SERVER_URL}/api/auth/login`, {
      email,
      password,
    }, { timeout: 5000 });
    assert.strictEqual(login.status, 200);
    const token = login.data.token || login.data.accessToken || login.data.jwt;
    assert.ok(token, 'login returned token');

    // get me
    const me = await axios.get(`${SERVER_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000,
    });
    assert.strictEqual(me.status, 200);
    assert.strictEqual(me.data.email, email);
  });
});
