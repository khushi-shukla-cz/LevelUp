// packages/server/src/routes/problems.js
const router = require('express').Router();
const { optionalAuth, authenticate } = require('../middleware/auth');
const { getProblems, getProblem } = require('../controllers/problems.controller');

router.get('/', optionalAuth, getProblems);
router.get('/:slug', optionalAuth, getProblem);

module.exports = router;
