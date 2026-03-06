const { Admin } = require('./models');
const bcrypt = require('bcryptjs');

async function createAdmin(username, password) {
    try {
        const admin = await Admin.create({
            username: username,
            password: password // The model setter will hash this automatically
        });
        console.log(`Successfully created admin user: ${username}`);
        process.exit(0);
    } catch (error) {
        console.error('Failed to create admin:', error.message);
        process.exit(1);
    }
}

// Default credentials - CHANGE THESE
const user = process.argv[2] || 'admin';
const pass = process.argv[3] || 'ruthless123';

createAdmin(user, pass);
