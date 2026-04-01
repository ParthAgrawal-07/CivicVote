// backend/src/controllers/voteController.js
const prisma = require('../models/prisma');
const { hashVoterToken } = require('../utils/hash');
const { logAudit } = require('../utils/audit');

// POST /api/elections/:id/vote
// SECURITY: vote is anonymous — we store a hashed token, never the raw userId
exports.castVote = async (req, res, next) => {
  try {
    const { id: electionId } = req.params;
    const { candidateId } = req.body;
    const userId = req.user.id;

    // 1. Verify election exists and is LIVE
    const election = await prisma.election.findUnique({
      where: { id: electionId },
      include: { candidates: { select: { id: true } } },
    });

    if (!election) {
      return res.status(404).json({ error: 'Election not found.' });
    }
    if (election.status !== 'LIVE') {
      return res.status(400).json({ error: 'This election is not currently open.' });
    }
    const now = new Date();
    if (now < election.startsAt || now > election.endsAt) {
      return res.status(400).json({ error: 'This election is not currently open.' });
    }

    // 2. Verify candidate belongs to this election
    const validCandidate = election.candidates.some(c => c.id === candidateId);
    if (!validCandidate) {
      return res.status(400).json({ error: 'Invalid candidate for this election.' });
    }

    // 3. Generate anonymous voter token — sha256(userId + electionId + APP_SECRET)
    //    This token allows duplicate detection WITHOUT storing userId in Ballot
    const voterToken = hashVoterToken(userId, electionId);

    // 4. Attempt to create ballot — DB unique constraint prevents double voting
    try {
      await prisma.ballot.create({
        data: { voterToken, electionId, candidateId },
      });
    } catch (err) {
      // Prisma unique constraint violation
      if (err.code === 'P2002') {
        await logAudit(
          'WARN',
          'Duplicate vote attempt blocked',
          `Token ${voterToken.slice(0, 8)}... already voted in "${election.title}"`,
          null // don't log userId for anonymity
        );
        return res.status(409).json({ error: 'You have already voted in this election.' });
      }
      throw err;
    }

    // 5. Log anonymously — just the hashed token prefix, never userId
    await logAudit(
      'VOTE',
      'Anonymous ballot recorded',
      `Token ${voterToken.slice(0, 8)}... · Election: "${election.title}"`,
      null
    );

    res.json({ success: true, message: 'Your vote has been recorded anonymously.' });
  } catch (err) {
    next(err);
  }
};
