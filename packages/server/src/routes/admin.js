// packages/server/src/routes/admin.js
const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/admin.controller');

// All admin routes require auth + admin role
router.use(authenticate, requireAdmin);

router.get('/stats', ctrl.getStats);

// Users
router.get('/users', ctrl.getUsers);
router.patch('/users/:id', ctrl.updateUser);
router.delete('/users/:id', ctrl.deleteUser);

// Worlds
router.post('/worlds', ctrl.createWorld);
router.patch('/worlds/:id', ctrl.updateWorld);
router.delete('/worlds/:id', ctrl.deleteWorld);

// Problems
router.get('/problems', ctrl.getAdminProblems);
router.post('/problems', ctrl.createProblem);
router.patch('/problems/:id', ctrl.updateProblem);
router.delete('/problems/:id', ctrl.deleteProblem);

// Quests
router.post('/quests', ctrl.createQuest);
router.patch('/quests/:id', ctrl.updateQuest);
router.delete('/quests/:id', ctrl.deleteQuest);

module.exports = router;
