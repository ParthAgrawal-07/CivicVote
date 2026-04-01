// backend/src/utils/audit.js
const prisma = require('../models/prisma');

/**
 * Log an audit event to the database.
 * @param {string} type - VOTE | ADMIN | WARN | SYS
 * @param {string} message - Short description
 * @param {string} detail - Extra context (never include raw userId for VOTE events)
 * @param {string|null} userId - null for anonymous vote events
 */
exports.logAudit = async (type, message, detail, userId = null) => {
  try {
    await prisma.auditLog.create({
      data: { type, message, detail, userId },
    });
  } catch (err) {
    // Never let audit logging crash the main request
    console.error('[AUDIT ERROR]', err.message);
  }
};
