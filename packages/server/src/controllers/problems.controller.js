// packages/server/src/controllers/problems.controller.js
const prisma = require('../services/prisma');

// GET /api/problems?worldId=&type=&difficulty=&page=&limit=
const getProblems = async (req, res, next) => {
  try {
    const { worldId, type, difficulty, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (worldId) where.worldId = worldId;
    if (type) where.type = type.toUpperCase();
    if (difficulty) where.difficulty = difficulty.toUpperCase();

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        orderBy: [{ worldId: 'asc' }, { order: 'asc' }],
        take: parseInt(limit),
        skip,
        select: {
          id: true, title: true, slug: true, type: true,
          difficulty: true, tags: true, xpReward: true,
          timeLimit: true, worldId: true, order: true,
          world: { select: { name: true, slug: true, color: true } },
          _count: { select: { submissions: true } }
        }
      }),
      prisma.problem.count({ where })
    ]);

    // Attach user submission status if authenticated
    let problemsWithStatus = problems.map(p => ({
      ...p,
      tags: JSON.parse(p.tags || '[]'),
    }));

    if (req.user) {
      const userSubs = await prisma.submission.findMany({
        where: {
          userId: req.user.id,
          problemId: { in: problems.map(p => p.id) },
          result: 'ACCEPTED'
        },
        select: { problemId: true }
      });
      const solvedSet = new Set(userSubs.map(s => s.problemId));
      problemsWithStatus = problemsWithStatus.map(p => ({
        ...p,
        isSolved: solvedSet.has(p.id),
      }));
    }

    res.json({
      problems: problemsWithStatus,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/problems/:slug
const getProblem = async (req, res, next) => {
  try {
    const problem = await prisma.problem.findUnique({
      where: { slug: req.params.slug },
      include: {
        world: { select: { name: true, slug: true, color: true, icon: true } },
      }
    });

    if (!problem) return res.status(404).json({ error: 'Problem not found' });

    // Parse JSON fields
    const parsed = {
      ...problem,
      tags: JSON.parse(problem.tags || '[]'),
      starterCode: problem.starterCode ? JSON.parse(problem.starterCode) : null,
      testCases: problem.testCases
        ? JSON.parse(problem.testCases).filter(tc => !tc.isHidden) // never send hidden cases
        : null,
      mcqOptions: problem.mcqOptions ? JSON.parse(problem.mcqOptions) : null,
      buggyCode: problem.buggyCode ? JSON.parse(problem.buggyCode) : null,
      // Never send solution to client
      solution: undefined,
    };

    // Attach user state
    if (req.user) {
      const [bestSub, allSubs] = await Promise.all([
        prisma.submission.findFirst({
          where: { userId: req.user.id, problemId: problem.id, result: 'ACCEPTED' },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.submission.findMany({
          where: { userId: req.user.id, problemId: problem.id },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { id: true, result: true, language: true, runtime: true, createdAt: true, testsPassed: true, testsTotal: true }
        })
      ]);

      parsed.isSolved = !!bestSub;
      parsed.recentSubmissions = allSubs;
    }

    res.json({ problem: parsed });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProblems, getProblem };
