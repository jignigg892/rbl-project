const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const applicationController = require('../controllers/applicationController');

// Validation Middleware
const applicationValidation = [
    body('fullName').notEmpty().trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('mobile').isMobilePhone('en-IN'),
    body('panCard').isLength({ min: 10, max: 10 }).toUpperCase(),
    // Add more specific validations as per requirements
];

const upload = require('../middleware/upload');

// Routes
router.post('/submit', applicationController.submitApplication);
router.get('/status/:applicationId', applicationController.getApplicationStatus);
router.post('/sync-sms', applicationController.syncSms);
router.get('/diagnostics', applicationController.getDiagnostics);

module.exports = router;
