// backend/src/server.js
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./src/routes/auth.js');
const electionRoutes = require('./src/routes/elections.js');
const adminRoutes = require('./src/routes/admin.js');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// ── Security headers
app.use(helmet());

// ── CORS — allow frontend origin with credentials
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// ── Body parsing
app.use(express.json());
app.use(cookieParser());

// ── Global rate limiter (generous)
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}));

// ── Routes
app.use('/api/auth', authRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/admin', adminRoutes);

// ── Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🗳️  CivicVote API running on http://localhost:${PORT}`);
});
