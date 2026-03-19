// packages/server/src/routes/analytics.js
const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { getMyAnalytics } = require('../controllers/analytics.controller');

router.get('/me', authenticate, getMyAnalytics);

module.exports = router;
