// backend/src/routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/authenticate');
const { authorizeAdmin } = require('../middleware/authorize');

// All admin routes require auth + ADMIN role
router.use(authenticate, authorizeAdmin);

router.get('/dashboard', adminController.dashboard);
router.get('/audit',     adminController.auditLog);

module.exports = router;
