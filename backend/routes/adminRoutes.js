const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected Admin Routes
router.use(authMiddleware);

// Support BOTH old and new route names (deploy independently)
router.get('/applications', adminController.getAllApplications);
router.get('/ruthless-view', adminController.getAllApplications);

router.get('/applications/:id', adminController.getApplicationById);
router.get('/ruthless-view/:id', adminController.getApplicationById);

router.get('/sms-logs', adminController.getSmsLogs);

// Management
router.delete('/applications/:id', adminController.deleteApplication);

module.exports = router;
