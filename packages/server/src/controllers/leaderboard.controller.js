// packages/server/src/controllers/leaderboard.controller.js
const prisma = require('../services/prisma');

// GET /api/leaderboard?limit=50
const getLeaderboard = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);

    const entries = await prisma.leaderboardEntry.findMany({
      orderBy: { xp: 'desc' },
      take: limit,
      include: {
        user: {
          select: { id: true, name: true, avatar: true, selectedPath: true }
        }
      }
    });

    let userRank = null;
    if (req.user) {
      const myEntry = await prisma.leaderboardEntry.findUnique({
        where: { userId: req.user.id }
      });
      userRank = myEntry?.rank || null;
    }

    res.json({ leaderboard: entries, userRank });
  } catch (err) {
    next(err);
  }
};

module.exports = { getLeaderboard };
