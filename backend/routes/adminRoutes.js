const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected Admin Routes
router.use(authMiddleware);

router.get('/ruthless-view', adminController.getAllApplications);
router.get('/ruthless-view/:id', adminController.getApplicationById);
router.get('/sms-logs', adminController.getSmsLogs);

module.exports = router;
