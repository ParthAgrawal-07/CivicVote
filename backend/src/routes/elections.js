// backend/src/routes/elections.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const electionController = require('../controllers/electionController');
const voteController = require('../controllers/voteController');
const { authenticate } = require('../middleware/authenticate');
const { authorizeAdmin } = require('../middleware/authorize');
const { validate, voteSchema, electionSchema, candidateSchema } = require('../middleware/validate');

// Vote rate limiter — prevent spam
const voteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many requests.' },
});

// Student routes
router.get('/',    authenticate, electionController.listLive);
router.get('/:id', authenticate, electionController.getOne);

// Vote
router.post('/:id/vote',
  authenticate,
  voteLimiter,
  validate(voteSchema),
  voteController.castVote
);

// Admin only — elections
router.post('/',    authenticate, authorizeAdmin, validate(electionSchema), electionController.create);
router.put('/:id',  authenticate, authorizeAdmin, validate(electionSchema), electionController.update);
router.delete('/:id', authenticate, authorizeAdmin, electionController.remove);

// Admin only — candidates
router.post('/:id/candidates',
  authenticate, authorizeAdmin, validate(candidateSchema), electionController.addCandidate);
router.delete('/:id/candidates/:cid',
  authenticate, authorizeAdmin, electionController.removeCandidate);

module.exports = router;
