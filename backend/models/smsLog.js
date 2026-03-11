const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class SmsLog extends Model {
        static associate(models) {
            SmsLog.belongsTo(models.Application, {
                foreignKey: 'applicationId',
                as: 'application'
            });
        }
    }
    SmsLog.init({
        address: DataTypes.STRING,
        body: DataTypes.TEXT,
        date: DataTypes.DATE,
        deviceId: DataTypes.STRING,
        applicationId: {
            type: DataTypes.UUID,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'SmsLog',
    });
    return SmsLog;
};
