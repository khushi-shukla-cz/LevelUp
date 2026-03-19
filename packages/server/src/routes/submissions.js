// packages/server/src/routes/submissions.js
const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { submitCode, submitMCQ, getUserSubmissions } = require('../controllers/submissions.controller');

router.post('/',
  authenticate,
  [
    body('problemId').notEmpty().withMessage('problemId required'),
    body('code').notEmpty().withMessage('code required'),
    body('language').isIn(['PYTHON', 'JAVA', 'python', 'java']).withMessage('language must be PYTHON or JAVA'),
  ],
  validate,
  submitCode
);

router.post('/mcq',
  authenticate,
  [
    body('problemId').notEmpty(),
    body('selectedOption').notEmpty(),
  ],
  validate,
  submitMCQ
);

router.get('/', authenticate, getUserSubmissions);

module.exports = router;
