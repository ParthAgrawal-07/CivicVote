// backend/src/controllers/electionController.js
const prisma = require('../models/prisma');
const { logAudit } = require('../utils/audit');
const { hashVoterToken } = require('../utils/hash');

// GET /api/elections — all LIVE elections for students
exports.listLive = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const elections = await prisma.election.findMany({
      where: { status: 'LIVE' },
      orderBy: { startsAt: 'desc' },
      include: {
        candidates: {
          select: { id: true, name: true, role: true, photoUrl: true },
          orderBy: { name: 'asc' },
        },
        _count: { select: { ballots: true } },
      },
    });

    // For each election, check if this user has already voted
    // We do this by computing their token and checking existence
    const result = await Promise.all(
      elections.map(async (e) => {
        const voterToken = hashVoterToken(userId, e.id);
        const existingBallot = await prisma.ballot.findUnique({
          where: { voterToken_electionId: { voterToken, electionId: e.id } },
          select: { candidateId: true },
        });
        return {
          ...e,
          votedCandidateId: existingBallot?.candidateId ?? null,
          totalVotes: e._count.ballots,
          _count: undefined,
        };
      })
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
};

// GET /api/elections/:id
exports.getOne = async (req, res, next) => {
  try {
    const election = await prisma.election.findUnique({
      where: { id: req.params.id },
      include: {
        candidates: true,
        _count: { select: { ballots: true } },
      },
    });
    if (!election) return res.status(404).json({ error: 'Election not found.' });

    const voterToken = hashVoterToken(req.user.id, election.id);
    const voted = await prisma.ballot.findUnique({
      where: { voterToken_electionId: { voterToken, electionId: election.id } },
      select: { candidateId: true },
    });

    res.json({ ...election, votedCandidateId: voted?.candidateId ?? null, totalVotes: election._count.ballots });
  } catch (err) {
    next(err);
  }
};

// POST /api/elections — admin creates election
exports.create = async (req, res, next) => {
  try {
    const { title, category, eligibleGroup, anonymous, allowWriteIn, showLive, startsAt, endsAt, candidates } = req.body;

    const election = await prisma.election.create({
      data: {
        title, category, eligibleGroup,
        anonymous: anonymous ?? true,
        allowWriteIn: allowWriteIn ?? false,
        showLive: showLive ?? false,
        status: 'LIVE',
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        candidates: candidates?.length
          ? { create: candidates.map(c => ({ name: c.name, role: c.role || '' })) }
          : undefined,
      },
      include: { candidates: true },
    });

    await logAudit('ADMIN', `Election "${title}" published`, `Admin · ${req.user.email}`, req.user.id);
    res.status(201).json(election);
  } catch (err) {
    next(err);
  }
};

// PUT /api/elections/:id — admin updates
exports.update = async (req, res, next) => {
  try {
    const { title, category, eligibleGroup, anonymous, allowWriteIn, showLive, status, startsAt, endsAt } = req.body;

    const election = await prisma.election.update({
      where: { id: req.params.id },
      data: {
        title, category, eligibleGroup,
        anonymous, allowWriteIn, showLive,
        status,
        startsAt: startsAt ? new Date(startsAt) : undefined,
        endsAt: endsAt ? new Date(endsAt) : undefined,
      },
    });

    await logAudit('ADMIN', `Election "${election.title}" updated`, `Admin · ${req.user.email}`, req.user.id);
    res.json(election);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/elections/:id — admin deletes
exports.remove = async (req, res, next) => {
  try {
    const election = await prisma.election.findUnique({ where: { id: req.params.id } });
    if (!election) return res.status(404).json({ error: 'Election not found.' });

    await prisma.election.delete({ where: { id: req.params.id } });
    await logAudit('WARN', `Election "${election.title}" deleted`, `Admin · ${req.user.email}`, req.user.id);
    res.json({ message: 'Election deleted.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/elections/:id/candidates
exports.addCandidate = async (req, res, next) => {
  try {
    const { name, role } = req.body;
    const candidate = await prisma.candidate.create({
      data: { name, role: role || '', electionId: req.params.id },
    });
    await logAudit('ADMIN', `Candidate "${name}" added`, `Admin · ${req.user.email}`, req.user.id);
    res.status(201).json(candidate);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/elections/:id/candidates/:cid
exports.removeCandidate = async (req, res, next) => {
  try {
    const candidate = await prisma.candidate.findUnique({ where: { id: req.params.cid } });
    if (!candidate) return res.status(404).json({ error: 'Candidate not found.' });

    await prisma.candidate.delete({ where: { id: req.params.cid } });
    await logAudit('WARN', `Candidate "${candidate.name}" removed`, `Admin · ${req.user.email}`, req.user.id);
    res.json({ message: 'Candidate removed.' });
  } catch (err) {
    next(err);
  }
};
