// backend/src/controllers/adminController.js
const prisma = require('../models/prisma');

// GET /api/admin/dashboard
exports.dashboard = async (req, res, next) => {
  try {
    const [totalVoters, totalBallots, elections] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT', verified: true } }),
      prisma.ballot.count(),
      prisma.election.findMany({
        include: {
          candidates: {
            include: { _count: { select: { ballots: true } } },
          },
          _count: { select: { ballots: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const turnout = totalVoters > 0 ? Math.round((totalBallots / totalVoters) * 100) : 0;

    const electionsWithResults = elections.map(e => ({
      id: e.id,
      title: e.title,
      category: e.category,
      status: e.status,
      eligible: e.eligibleGroup,
      closes: e.endsAt,
      totalVotes: e._count.ballots,
      candidates: e.candidates.map(c => ({
        id: c.id,
        name: c.name,
        role: c.role,
        votes: c._count.ballots,
      })),
    }));

    res.json({
      metrics: {
        totalVoters,
        totalBallots,
        turnout,
        activeElections: elections.filter(e => e.status === 'LIVE').length,
      },
      elections: electionsWithResults,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/admin/audit
exports.auditLog = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count(),
    ]);

    res.json({ logs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};
