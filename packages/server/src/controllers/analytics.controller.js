// packages/server/src/controllers/analytics.controller.js
const prisma = require('../services/prisma');
const { xpForLevel, totalXPForLevel } = require('../services/xpEngine');

// GET /api/analytics/me
const getMyAnalytics = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [user, submissions, questProgress, dailyLogs] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { xp: true, level: true, streak: true, coins: true, createdAt: true }
      }),
      prisma.submission.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: { problem: { select: { difficulty: true, type: true, worldId: true } } }
      }),
      prisma.userQuestProgress.findMany({
        where: { userId, completed: true },
        include: { quest: { select: { difficulty: true, type: true, xpReward: true } } }
      }),
      prisma.dailyQuestLog.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 30,
      })
    ]);

    // ── XP to next level ────────────────────────────────────────────────────
    const currentLevelXP = totalXPForLevel(user.level);
    const nextLevelXP = totalXPForLevel(user.level + 1);
    const xpIntoLevel = user.xp - currentLevelXP;
    const xpNeeded = nextLevelXP - currentLevelXP;
    const levelProgress = Math.round((xpIntoLevel / xpNeeded) * 100);

    // ── Submission stats ────────────────────────────────────────────────────
    const totalSubmissions = submissions.length;
    const acceptedSubmissions = submissions.filter(s => s.result === 'ACCEPTED').length;
    const accuracy = totalSubmissions > 0
      ? Math.round((acceptedSubmissions / totalSubmissions) * 100)
      : 0;

    // ── Problems by difficulty ──────────────────────────────────────────────
    const solvedByDifficulty = { EASY: 0, MEDIUM: 0, HARD: 0, BOSS: 0 };
    const uniqueSolved = new Set();
    for (const sub of submissions) {
      if (sub.result === 'ACCEPTED' && !uniqueSolved.has(sub.problemId)) {
        uniqueSolved.add(sub.problemId);
        solvedByDifficulty[sub.problem.difficulty] = (solvedByDifficulty[sub.problem.difficulty] || 0) + 1;
      }
    }

    // ── Activity heatmap (last 30 days) ─────────────────────────────────────
    const heatmap = {};
    for (const log of dailyLogs) {
      heatmap[log.date] = { xpEarned: log.xpEarned, completed: log.completed };
    }

    // ── Daily XP chart (last 14 days) ───────────────────────────────────────
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(Date.now() - i * 86400000);
      return d.toISOString().split('T')[0];
    }).reverse();

    const xpChart = last14Days.map(date => ({
      date,
      xp: heatmap[date]?.xpEarned || 0,
    }));

    // ── Submission type breakdown ────────────────────────────────────────────
    const typeBreakdown = { CODING: 0, MCQ: 0, DEBUGGING: 0 };
    for (const sub of submissions) {
      const type = sub.problem?.type;
      if (type && typeBreakdown[type] !== undefined) typeBreakdown[type]++;
    }

    res.json({
      overview: {
        xp: user.xp,
        level: user.level,
        streak: user.streak,
        coins: user.coins,
        levelProgress,
        xpIntoLevel,
        xpNeeded,
        totalSolved: uniqueSolved.size,
        accuracy,
        totalSubmissions,
        questsCompleted: questProgress.length,
        daysActive: Object.keys(heatmap).length,
        memberSince: user.createdAt,
      },
      solvedByDifficulty,
      xpChart,
      typeBreakdown,
      heatmap,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyAnalytics };
