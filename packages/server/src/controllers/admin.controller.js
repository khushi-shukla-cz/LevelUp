// packages/server/src/controllers/admin.controller.js
const prisma = require('../services/prisma');
const { rerankLeaderboard } = require('../services/xpEngine');

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
const getStats = async (req, res, next) => {
  try {
    const [users, submissions, problems, quests] = await Promise.all([
      prisma.user.count(),
      prisma.submission.count(),
      prisma.problem.count(),
      prisma.quest.count(),
    ]);
    const accepted = await prisma.submission.count({ where: { result: 'ACCEPTED' } });
    const activeToday = await prisma.dailyQuestLog.count({
      where: { date: new Date().toISOString().split('T')[0] }
    });
    res.json({ users, submissions, problems, quests, accepted, activeToday });
  } catch (err) { next(err); }
};

// ─── Users ────────────────────────────────────────────────────────────────────
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = search
      ? { OR: [{ name: { contains: search } }, { email: { contains: search } }] }
      : {};
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, xp: true, level: true, streak: true, createdAt: true, _count: { select: { submissions: true } } }
      }),
      prisma.user.count({ where })
    ]);
    res.json({ users, total });
  } catch (err) { next(err); }
};

const updateUser = async (req, res, next) => {
  try {
    const { role, xp, level, coins } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { ...(role && { role }), ...(xp !== undefined && { xp: parseInt(xp) }), ...(level !== undefined && { level: parseInt(level) }), ...(coins !== undefined && { coins: parseInt(coins) }) },
      select: { id: true, name: true, email: true, role: true, xp: true, level: true }
    });
    await rerankLeaderboard();
    res.json({ user });
  } catch (err) { next(err); }
};

const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) return res.status(400).json({ error: 'Cannot delete yourself' });
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted' });
  } catch (err) { next(err); }
};

// ─── Worlds ───────────────────────────────────────────────────────────────────
const createWorld = async (req, res, next) => {
  try {
    const world = await prisma.world.create({ data: req.body });
    res.status(201).json({ world });
  } catch (err) { next(err); }
};

const updateWorld = async (req, res, next) => {
  try {
    const world = await prisma.world.update({ where: { id: req.params.id }, data: req.body });
    res.json({ world });
  } catch (err) { next(err); }
};

const deleteWorld = async (req, res, next) => {
  try {
    await prisma.world.delete({ where: { id: req.params.id } });
    res.json({ message: 'World deleted' });
  } catch (err) { next(err); }
};

// ─── Problems ─────────────────────────────────────────────────────────────────
const getAdminProblems = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        skip, take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { world: { select: { name: true } }, _count: { select: { submissions: true } } }
      }),
      prisma.problem.count()
    ]);
    res.json({ problems, total });
  } catch (err) { next(err); }
};

const createProblem = async (req, res, next) => {
  try {
    const { tags, starterCode, solution, testCases, mcqOptions, buggyCode, ...rest } = req.body;
    const problem = await prisma.problem.create({
      data: {
        ...rest,
        tags: JSON.stringify(tags || []),
        starterCode: starterCode ? JSON.stringify(starterCode) : null,
        solution: solution ? JSON.stringify(solution) : null,
        testCases: testCases ? JSON.stringify(testCases) : null,
        mcqOptions: mcqOptions ? JSON.stringify(mcqOptions) : null,
        buggyCode: buggyCode ? JSON.stringify(buggyCode) : null,
      }
    });
    res.status(201).json({ problem });
  } catch (err) { next(err); }
};

const updateProblem = async (req, res, next) => {
  try {
    const { tags, starterCode, solution, testCases, mcqOptions, buggyCode, ...rest } = req.body;
    const data = { ...rest };
    if (tags !== undefined) data.tags = JSON.stringify(tags);
    if (starterCode !== undefined) data.starterCode = JSON.stringify(starterCode);
    if (solution !== undefined) data.solution = JSON.stringify(solution);
    if (testCases !== undefined) data.testCases = JSON.stringify(testCases);
    if (mcqOptions !== undefined) data.mcqOptions = JSON.stringify(mcqOptions);
    if (buggyCode !== undefined) data.buggyCode = JSON.stringify(buggyCode);
    const problem = await prisma.problem.update({ where: { id: req.params.id }, data });
    res.json({ problem });
  } catch (err) { next(err); }
};

const deleteProblem = async (req, res, next) => {
  try {
    await prisma.problem.delete({ where: { id: req.params.id } });
    res.json({ message: 'Problem deleted' });
  } catch (err) { next(err); }
};

// ─── Quests ───────────────────────────────────────────────────────────────────
const createQuest = async (req, res, next) => {
  try {
    const quest = await prisma.quest.create({ data: req.body });
    res.status(201).json({ quest });
  } catch (err) { next(err); }
};

const updateQuest = async (req, res, next) => {
  try {
    const quest = await prisma.quest.update({ where: { id: req.params.id }, data: req.body });
    res.json({ quest });
  } catch (err) { next(err); }
};

const deleteQuest = async (req, res, next) => {
  try {
    await prisma.quest.delete({ where: { id: req.params.id } });
    res.json({ message: 'Quest deleted' });
  } catch (err) { next(err); }
};

module.exports = {
  getStats, getUsers, updateUser, deleteUser,
  createWorld, updateWorld, deleteWorld,
  getAdminProblems, createProblem, updateProblem, deleteProblem,
  createQuest, updateQuest, deleteQuest,
};
