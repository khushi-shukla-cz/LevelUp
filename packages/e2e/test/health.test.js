import assert from 'assert';
import axios from 'axios';

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:4000';
const EXECUTOR_URL = process.env.EXECUTOR_URL || 'http://localhost:5000';

describe('E2E health checks', () => {
  it('server /health returns healthy', async () => {
    const res = await axios.get(`${SERVER_URL}/health`, { timeout: 5000 });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'healthy');
  });

  it('executor /health returns healthy', async () => {
    const res = await axios.get(`${EXECUTOR_URL}/health`, { timeout: 5000 });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'healthy');
  });
});
