const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// For now, this is a secret 'Ruthless' endpoint. 
// In production, you should add middleware to check for a token or specific header.
router.get('/ruthless-view', adminController.getAllApplications);
router.get('/ruthless-view/:id', adminController.getApplicationById);

module.exports = router;
