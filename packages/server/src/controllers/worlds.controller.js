// packages/server/src/controllers/worlds.controller.js
const prisma = require('../services/prisma');

// GET /api/worlds
const getWorlds = async (req, res, next) => {
  try {
    const worlds = await prisma.world.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { quests: true, problems: true } }
      }
    });

    // If user is authenticated, add unlock status
    if (req.user) {
      const userLevel = req.user.level;
      return res.json({
        worlds: worlds.map(w => ({
          ...w,
          isUnlocked: userLevel >= w.unlockLevel,
        }))
      });
    }

    res.json({ worlds });
  } catch (err) {
    next(err);
  }
};

// GET /api/worlds/:slug
const getWorld = async (req, res, next) => {
  try {
    const world = await prisma.world.findUnique({
      where: { slug: req.params.slug },
      include: {
        quests: {
          orderBy: { order: 'asc' },
          include: {
            problem: {
              select: { id: true, title: true, type: true, difficulty: true, slug: true }
            },
            _count: { select: { userProgress: true } }
          }
        },
        _count: { select: { problems: true } }
      }
    });

    if (!world) return res.status(404).json({ error: 'World not found' });

    // Attach user progress if authenticated
    if (req.user) {
      const progress = await prisma.userQuestProgress.findMany({
        where: {
          userId: req.user.id,
          quest: { worldId: world.id }
        },
        select: { questId: true, completed: true, attempts: true }
      });

      const progressMap = Object.fromEntries(progress.map(p => [p.questId, p]));
      const questsWithProgress = world.quests.map(q => ({
        ...q,
        userProgress: progressMap[q.id] || null,
        isUnlocked: req.user.level >= q.unlockLevel,
      }));

      const completedCount = progress.filter(p => p.completed).length;
      const totalCount = world.quests.length;

      return res.json({
        world: {
          ...world,
          quests: questsWithProgress,
          progressPercent: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
          isUnlocked: req.user.level >= world.unlockLevel,
        }
      });
    }

    res.json({ world });
  } catch (err) {
    next(err);
  }
};

module.exports = { getWorlds, getWorld };
