import assert from 'assert';
import axios from 'axios';

const EXECUTOR_URL = process.env.EXECUTOR_URL || 'http://localhost:5000';

describe('Executor /run', () => {
  it('executes Python code and returns output', async () => {
    const code = `s = input()\nprint(s[::-1])`;
    const res = await axios.post(`${EXECUTOR_URL}/run`, { code, language: 'PYTHON', input: 'hello' }, { timeout: 20000 });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.output.trim(), 'olleh');
    assert.ok(res.data.runtime >= 0);
  });
});
