const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.get('/data', isAuthenticated, isAdmin, adminController.getAdminPage);

module.exports = router;
