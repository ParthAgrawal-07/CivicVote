// backend/src/middleware/authenticate.js
const { verifyAccess } = require('../utils/jwt');

exports.authenticate = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  const token = header.split(' ')[1];
  try {
    const payload = verifyAccess(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
