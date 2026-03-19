// packages/server/src/routes/leaderboard.js
const router = require('express').Router();
const { optionalAuth } = require('../middleware/auth');
const { getLeaderboard } = require('../controllers/leaderboard.controller');

router.get('/', optionalAuth, getLeaderboard);

module.exports = router;
