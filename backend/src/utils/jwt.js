// backend/src/utils/jwt.js
const jwt = require('jsonwebtoken');

exports.signAccess = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });

exports.signRefresh = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

exports.verifyAccess = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);

exports.verifyRefresh = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET);
