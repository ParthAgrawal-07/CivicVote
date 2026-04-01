// backend/src/controllers/authController.js
const bcrypt = require('bcryptjs');
const prisma = require('../models/prisma');
const { signAccess, signRefresh, verifyRefresh } = require('../utils/jwt');
const { sendOtp } = require('../utils/email');
const { logAudit } = require('../utils/audit');
const crypto = require('crypto');

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { studentId, email, password } = req.body;

    const user = await prisma.user.findFirst({
      where: { email, studentId },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      await logAudit('WARN', 'Failed login attempt', `Email: ${email}`, null);
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // If not verified, send OTP
    if (!user.verified) {
      const otp = await generateOtp(user.id);
      await sendOtp(user.email, otp);
      return res.json({
        requiresOtp: true,
        userId: user.id,
        message: 'OTP sent to your college email.',
      });
    }

    // Issue tokens
    const accessToken = signAccess({ id: user.id, role: user.role });
    const refreshToken = signRefresh({ id: user.id });

    res.cookie('refreshToken', refreshToken, COOKIE_OPTS);

    await logAudit('SYS', 'User authenticated', `${email} · ID: ${studentId}`, user.id);

    res.json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
        year: user.year,
        department: user.department,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/verify-otp
exports.verifyOtp = async (req, res, next) => {
  try {
    const { userId, code } = req.body;

    const otp = await prisma.otp.findFirst({
      where: {
        userId,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    // Mark OTP used & verify user
    await prisma.$transaction([
      prisma.otp.update({ where: { id: otp.id }, data: { used: true } }),
      prisma.user.update({ where: { id: userId }, data: { verified: true } }),
    ]);

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const accessToken = signAccess({ id: user.id, role: user.role });
    const refreshToken = signRefresh({ id: user.id });

    res.cookie('refreshToken', refreshToken, COOKIE_OPTS);
    await logAudit('SYS', 'User email verified via OTP', user.email, user.id);

    res.json({
      accessToken,
      user: { id: user.id, name: user.name, email: user.email, studentId: user.studentId, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh
exports.refresh = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ error: 'No refresh token.' });

    const payload = verifyRefresh(token);
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return res.status(401).json({ error: 'User not found.' });

    const accessToken = signAccess({ id: user.id, role: user.role });
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ error: 'Invalid refresh token.' });
  }
};

// POST /api/auth/logout
exports.logout = async (req, res) => {
  res.clearCookie('refreshToken');
  await logAudit('SYS', 'User signed out', req.user.email || '', req.user.id);
  res.json({ message: 'Signed out.' });
};

// GET /api/auth/me
exports.me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, studentId: true, role: true, year: true, department: true },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// ── Helper
async function generateOtp(userId) {
  const code = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  // Invalidate old OTPs
  await prisma.otp.updateMany({
    where: { userId, used: false },
    data: { used: true },
  });

  await prisma.otp.create({ data: { userId, code, expiresAt } });
  return code;
}
