// packages/server/src/routes/users.js
const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const prisma = require('../services/prisma');

// GET /api/users/me/skill-tree
router.get('/me/skill-tree', authenticate, async (req, res, next) => {
  try {
    const [allNodes, userNodes] = await Promise.all([
      prisma.skillNode.findMany({ orderBy: { unlockXP: 'asc' } }),
      prisma.userSkillNode.findMany({
        where: { userId: req.user.id },
        select: { skillNodeId: true, unlocked: true, unlockedAt: true }
      })
    ]);
    const unlockedMap = Object.fromEntries(userNodes.map(n => [n.skillNodeId, n]));
    const nodes = allNodes.map(n => ({
      ...n,
      prerequisites: JSON.parse(n.prerequisites || '[]'),
      userStatus: unlockedMap[n.id] || { unlocked: false },
      canUnlock: req.user.xp >= n.unlockXP,
    }));
    res.json({ nodes });
  } catch (err) { next(err); }
});

// POST /api/users/me/skill-tree/:nodeId/unlock
router.post('/me/skill-tree/:nodeId/unlock', authenticate, async (req, res, next) => {
  try {
    const node = await prisma.skillNode.findUnique({ where: { id: req.params.nodeId } });
    if (!node) return res.status(404).json({ error: 'Skill node not found' });
    if (req.user.xp < node.unlockXP) {
      return res.status(403).json({ error: `Need ${node.unlockXP} XP to unlock this skill` });
    }
    const userNode = await prisma.userSkillNode.upsert({
      where: { userId_skillNodeId: { userId: req.user.id, skillNodeId: node.id } },
      create: { userId: req.user.id, skillNodeId: node.id, unlocked: true, unlockedAt: new Date() },
      update: { unlocked: true, unlockedAt: new Date() }
    });
    res.json({ message: `${node.name} unlocked!`, node: { ...node, userStatus: userNode } });
  } catch (err) { next(err); }
});

// GET /api/users/me/progress
router.get('/me/progress', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        xp: true, level: true, coins: true, streak: true,
        currentWorldId: true, selectedPath: true,
        questProgress: { where: { completed: true }, select: { questId: true } },
        _count: { select: { submissions: true } }
      }
    });
    res.json({ progress: user });
  } catch (err) { next(err); }
});

module.exports = router;
