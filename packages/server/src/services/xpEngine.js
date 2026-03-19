// packages/server/src/services/xpEngine.js
// Central XP economy — all reward calculations go through here

const prisma = require('./prisma');
const logger = require('./logger');

// ─── Level thresholds ─────────────────────────────────────────────────────────
// XP required to reach level N: 100 * N^1.5
const xpForLevel = (level) => Math.floor(100 * Math.pow(level, 1.5));

const totalXPForLevel = (level) => {
  let total = 0;
  for (let i = 1; i < level; i++) total += xpForLevel(i);
  return total;
};

const levelFromXP = (xp) => {
  let level = 1;
  while (totalXPForLevel(level + 1) <= xp) level++;
  return level;
};

// ─── XP reward formula ────────────────────────────────────────────────────────
// base * difficulty_multiplier * streak_multiplier
const DIFFICULTY_MULTIPLIERS = {
  EASY: 1.0,
  MEDIUM: 1.5,
  HARD: 2.0,
  BOSS: 3.0,
};

const streakMultiplier = (streak) => {
  if (streak >= 30) return 2.0;
  if (streak >= 14) return 1.75;
  if (streak >= 7) return 1.5;
  if (streak >= 3) return 1.25;
  return 1.0;
};

const calculateXPReward = ({ baseXP, difficulty, streak = 0 }) => {
  const diffMult = DIFFICULTY_MULTIPLIERS[difficulty] || 1.0;
  const streakMult = streakMultiplier(streak);
  return Math.floor(baseXP * diffMult * streakMult);
};

// ─── Award XP to user ─────────────────────────────────────────────────────────
async function awardXP(userId, xpAmount, reason = '') {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const oldLevel = user.level;
  const newXP = user.xp + xpAmount;
  const newLevel = levelFromXP(newXP);
  const leveledUp = newLevel > oldLevel;

  // Update user
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { xp: newXP, level: newLevel },
    select: { id: true, xp: true, level: true, coins: true, streak: true, name: true }
  });

  // Update leaderboard
  await prisma.leaderboardEntry.upsert({
    where: { userId },
    update: { xp: newXP, level: newLevel },
    create: { userId, xp: newXP, level: newLevel, streak: user.streak }
  });

  // Rerank leaderboard (async, non-blocking)
  rerankLeaderboard().catch(e => logger.error('Rerank failed', e));

  logger.info(`XP awarded: ${xpAmount} to user ${userId} (${reason}) → Level ${newLevel}`);

  return { xpGained: xpAmount, totalXP: newXP, level: newLevel, leveledUp, oldLevel };
}

// ─── Award coins ──────────────────────────────────────────────────────────────
async function awardCoins(userId, amount) {
  return prisma.user.update({
    where: { id: userId },
    data: { coins: { increment: amount } },
    select: { coins: true }
  });
}

// ─── Update streak ────────────────────────────────────────────────────────────
async function updateStreak(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let newStreak = user.streak;

  if (user.lastActiveDate === today) {
    // Already active today, no change
    return { streak: newStreak, extended: false };
  } else if (user.lastActiveDate === yesterday) {
    // Consecutive day
    newStreak++;
  } else {
    // Streak broken
    newStreak = 1;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { streak: newStreak, lastActiveDate: today }
  });

  // Update leaderboard streak
  await prisma.leaderboardEntry.upsert({
    where: { userId },
    update: { streak: newStreak },
    create: { userId, xp: user.xp, level: user.level, streak: newStreak }
  });

  return { streak: newStreak, extended: newStreak > user.streak };
}

// ─── Rerank leaderboard ───────────────────────────────────────────────────────
async function rerankLeaderboard() {
  const entries = await prisma.leaderboardEntry.findMany({
    orderBy: { xp: 'desc' }
  });

  const updates = entries.map((entry, idx) =>
    prisma.leaderboardEntry.update({
      where: { id: entry.id },
      data: { rank: idx + 1 }
    })
  );

  await prisma.$transaction(updates);
}

module.exports = {
  awardXP,
  awardCoins,
  updateStreak,
  calculateXPReward,
  levelFromXP,
  xpForLevel,
  totalXPForLevel,
  rerankLeaderboard,
};
