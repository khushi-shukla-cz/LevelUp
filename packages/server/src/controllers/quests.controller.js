// packages/server/src/controllers/quests.controller.js
const prisma = require('../services/prisma');
const { awardXP, awardCoins, updateStreak } = require('../services/xpEngine');

// GET /api/quests?worldId=&type=
const getQuests = async (req, res, next) => {
  try {
    const { worldId, type } = req.query;
    const where = { isActive: true };
    if (worldId) where.worldId = worldId;
    if (type) where.type = type.toUpperCase();

    const quests = await prisma.quest.findMany({
      where,
      orderBy: [{ worldId: 'asc' }, { order: 'asc' }],
      include: {
        world: { select: { name: true, slug: true, color: true, icon: true } },
        problem: { select: { id: true, title: true, type: true, difficulty: true, slug: true } },
      }
    });

    if (req.user) {
      const progress = await prisma.userQuestProgress.findMany({
        where: { userId: req.user.id },
        select: { questId: true, completed: true, attempts: true }
      });
      const progressMap = Object.fromEntries(progress.map(p => [p.questId, p]));

      return res.json({
        quests: quests.map(q => ({
          ...q,
          userProgress: progressMap[q.id] || null,
          isUnlocked: req.user.level >= q.unlockLevel,
        }))
      });
    }

    res.json({ quests });
  } catch (err) {
    next(err);
  }
};

// GET /api/quests/daily
const getDailyQuests = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get daily quests unlocked for user's level
    const dailyQuests = await prisma.quest.findMany({
      where: {
        type: 'DAILY',
        isActive: true,
        unlockLevel: { lte: req.user.level }
      },
      include: {
        world: { select: { name: true, color: true, icon: true } },
        problem: { select: { title: true, type: true, difficulty: true, slug: true } },
      },
      orderBy: { xpReward: 'desc' },
      take: 3,
    });

    const progress = await prisma.userQuestProgress.findMany({
      where: {
        userId: req.user.id,
        questId: { in: dailyQuests.map(q => q.id) }
      },
      select: { questId: true, completed: true, completedAt: true }
    });

    const progressMap = Object.fromEntries(progress.map(p => [p.questId, p]));

    // Check if completed today
    const questsWithStatus = dailyQuests.map(q => {
      const prog = progressMap[q.id];
      const completedToday = prog?.completedAt
        ? new Date(prog.completedAt).toISOString().split('T')[0] === today
        : false;
      return { ...q, completedToday, progress: prog || null };
    });

    const dailyLog = await prisma.dailyQuestLog.findUnique({
      where: { userId_date: { userId: req.user.id, date: today } }
    });

    res.json({
      quests: questsWithStatus,
      dailyXPEarned: dailyLog?.xpEarned || 0,
      allDoneToday: questsWithStatus.every(q => q.completedToday),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/quests/:id/complete
const completeQuest = async (req, res, next) => {
  try {
    const quest = await prisma.quest.findUnique({
      where: { id: req.params.id },
      include: { world: true }
    });
    if (!quest) return res.status(404).json({ error: 'Quest not found' });

    if (req.user.level < quest.unlockLevel) {
      return res.status(403).json({ error: `Requires level ${quest.unlockLevel}` });
    }

    // Upsert progress
    const existing = await prisma.userQuestProgress.findUnique({
      where: { userId_questId: { userId: req.user.id, questId: quest.id } }
    });

    if (existing?.completed) {
      return res.json({ message: 'Quest already completed', alreadyDone: true });
    }

    await prisma.userQuestProgress.upsert({
      where: { userId_questId: { userId: req.user.id, questId: quest.id } },
      create: {
        userId: req.user.id, questId: quest.id,
        completed: true, completedAt: new Date(), attempts: 1
      },
      update: {
        completed: true, completedAt: new Date(),
        attempts: { increment: 1 }
      }
    });

    // Award rewards
    const xpResult = await awardXP(req.user.id, quest.xpReward, `Quest: ${quest.title}`);
    if (quest.coinReward > 0) await awardCoins(req.user.id, quest.coinReward);
    const streakResult = await updateStreak(req.user.id);

    // Log daily XP
    const today = new Date().toISOString().split('T')[0];
    await prisma.dailyQuestLog.upsert({
      where: { userId_date: { userId: req.user.id, date: today } },
      create: { userId: req.user.id, date: today, xpEarned: quest.xpReward, completed: true },
      update: { xpEarned: { increment: quest.xpReward } }
    });

    res.json({
      message: 'Quest completed!',
      quest,
      xpResult,
      streakResult,
      coinReward: quest.coinReward,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getQuests, getDailyQuests, completeQuest };
