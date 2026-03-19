// packages/server/src/controllers/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../services/prisma');
const logger = require('../services/logger');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const userPublicFields = {
  id: true, name: true, email: true, role: true,
  xp: true, level: true, coins: true, streak: true,
  avatar: true, onboardingDone: true, selectedPath: true,
  skillLevel: true, dailyGoalHours: true, currentWorldId: true,
  createdAt: true,
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: userPublicFields,
    });

    // Create leaderboard entry
    await prisma.leaderboardEntry.create({
      data: { userId: user.id, xp: 0, level: 1, streak: 0 }
    });

    const token = signToken(user);

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { ...userPublicFields, passwordHash: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Remove passwordHash from response
    const { passwordHash, ...safeUser } = user;
    const token = signToken(safeUser);

    logger.info(`User logged in: ${email}`);

    res.json({ token, user: safeUser });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        ...userPublicFields,
        currentWorld: {
          select: { id: true, name: true, slug: true, icon: true, color: true }
        },
        _count: {
          select: { submissions: true, questProgress: true }
        }
      },
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh
const refresh = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: userPublicFields,
    });
    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/auth/onboarding
const completeOnboarding = async (req, res, next) => {
  try {
    const { selectedPath, skillLevel, dailyGoalHours, currentWorldId } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        onboardingDone: true,
        selectedPath,
        skillLevel,
        dailyGoalHours: parseInt(dailyGoalHours) || 1,
        currentWorldId,
        // Award welcome XP
        xp: { increment: 100 },
        coins: { increment: 50 },
      },
      select: userPublicFields,
    });

    const token = signToken(user);
    res.json({ message: 'Onboarding complete', token, user });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, refresh, completeOnboarding };
