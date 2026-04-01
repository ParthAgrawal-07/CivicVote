// backend/src/routes/auth.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authenticate');
const { validate } = require('../middleware/validate');
const { loginSchema, otpSchema } = require('../middleware/validate');

// Strict rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 10,
  message: { error: 'Too many login attempts. Please wait a minute.' },
});

router.post('/login',      authLimiter, validate(loginSchema), authController.login);
router.post('/verify-otp', authLimiter, validate(otpSchema),   authController.verifyOtp);
router.post('/refresh',    authController.refresh);
router.post('/logout',     authenticate, authController.logout);
router.get('/me',          authenticate, authController.me);

module.exports = router;
