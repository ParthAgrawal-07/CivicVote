// backend/src/middleware/validate.js
const { z } = require('zod');

exports.validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: result.error.flatten().fieldErrors,
    });
  }
  req.body = result.data;
  next();
};

// ── Schemas ──
exports.loginSchema = z.object({
  studentId: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

exports.otpSchema = z.object({
  userId: z.string().cuid(),
  code: z.string().length(6),
});

exports.voteSchema = z.object({
  candidateId: z.string().cuid(),
});

exports.electionSchema = z.object({
  title: z.string().min(3).max(120),
  category: z.enum(['PRESIDENT_VP', 'CLUB_HEAD', 'CLASS_REP']),
  eligibleGroup: z.string().default('ALL'),
  anonymous: z.boolean().default(true),
  allowWriteIn: z.boolean().default(false),
  showLive: z.boolean().default(false),
  status: z.enum(['DRAFT', 'LIVE', 'CLOSED']).optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  candidates: z.array(z.object({
    name: z.string().min(2).max(80),
    role: z.string().max(100).optional(),
  })).optional(),
});

exports.candidateSchema = z.object({
  name: z.string().min(2).max(80),
  role: z.string().max(100).optional(),
});
