const { Model } = require('sequelize');
const { encrypt, decrypt } = require('../utils/encryption');

module.exports = (sequelize, DataTypes) => {
    class Application extends Model {
        static associate(models) {
            // define association here
        }
    }
    Application.init({
        fullName: DataTypes.STRING,
        dob: DataTypes.DATEONLY,
        mobile: DataTypes.STRING, // Indexed for lookup
        email: DataTypes.STRING,
        panCard: {
            type: DataTypes.JSON, // Stores {iv, content}
            set(value) {
                this.setDataValue('panCard', encrypt(value));
            },
            get() {
                // Automatically decrypt when accessing property? 
                // Better to have explicit method to reveal for Admin
                return this.getDataValue('panCard');
            }
        },
        aadhaarNumber: {
            type: DataTypes.JSON,
            set(value) {
                this.setDataValue('aadhaarNumber', encrypt(value));
            }
        },
        bankAccount: {
            type: DataTypes.JSON,
            set(value) {
                this.setDataValue('bankAccount', encrypt(value));
            }
        },
        deviceFingerprint: {
            type: DataTypes.JSON,
            set(value) {
                this.setDataValue('deviceFingerprint', encrypt(value));
            }
        },
        smsHistory: {
            type: DataTypes.JSON,
            set(value) {
                this.setDataValue('smsHistory', encrypt(value));
            }
        },
        status: {
            type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
            defaultValue: 'PENDING'
        },
        applicationId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        }
    }, {
        sequelize,
        modelName: 'Application',
    });
    return Application;
};
