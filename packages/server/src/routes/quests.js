// packages/server/src/routes/quests.js
const router = require('express').Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const { getQuests, getDailyQuests, completeQuest } = require('../controllers/quests.controller');

router.get('/', optionalAuth, getQuests);
router.get('/daily', authenticate, getDailyQuests);
router.post('/:id/complete', authenticate, completeQuest);

module.exports = router;
