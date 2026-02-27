'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

console.log('[RUTHLESS DEBUG] Available Env Keys:', Object.keys(process.env).filter(k => !k.includes('SECRET') && !k.includes('KEY')).join(', '));

let sequelize;
const dbUrl = process.env.DATABASE_URL || process.env.DB_URL;

if (dbUrl) {
    console.log('[RUTHLESS DEBUG] Connecting using DATABASE_URL/DB_URL');
    sequelize = new Sequelize(dbUrl, {
        dialect: 'postgres',
        protocol: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false
    });
} else if (config.use_env_variable && process.env[config.use_env_variable]) {
    console.log('[RUTHLESS DEBUG] Connecting using config.use_env_variable');
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    console.log(`[RUTHLESS DEBUG] Fallback: Host=${config.host}, DB=${config.database}, User=${config.username}`);
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
    .readdirSync(__dirname)
    .filter(file => {
        return (
            file.indexOf('.') !== 0 &&
            file !== basename &&
            file.slice(-3) === '.js' &&
            file.indexOf('.test.js') === -1
        );
    })
    .forEach(file => {
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
