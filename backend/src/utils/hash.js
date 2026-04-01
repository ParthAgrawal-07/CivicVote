// backend/src/utils/hash.js
const crypto = require('crypto');

/**
 * Generates an anonymous voter token.
 * sha256(userId + electionId + APP_SECRET)
 *
 * This allows the system to detect if a user already voted
 * WITHOUT ever storing the userId in the Ballot table.
 * The token is one-way — you cannot recover the userId from it.
 */
exports.hashVoterToken = (userId, electionId) => {
  const secret = process.env.APP_SECRET || 'change-this-in-production';
  return crypto
    .createHmac('sha256', secret)
    .update(`${userId}:${electionId}`)
    .digest('hex');
};
