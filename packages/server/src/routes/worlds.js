// packages/server/src/routes/worlds.js
const router = require('express').Router();
const { optionalAuth } = require('../middleware/auth');
const { getWorlds, getWorld } = require('../controllers/worlds.controller');

router.get('/', optionalAuth, getWorlds);
router.get('/:slug', optionalAuth, getWorld);

module.exports = router;
