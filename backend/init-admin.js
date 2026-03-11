const { Admin } = require('./models');

async function createAdmin(username, password) {
    if (!username || !password) {
        console.error('Usage: node init-admin.js <username> <password>');
        process.exit(1);
    }
    try {
        await Admin.create({
            username: username,
            password: password
        });
        console.log('Admin user created');
        process.exit(0);
    } catch (error) {
        console.error('Failed to create admin');
        process.exit(1);
    }
}

const user = process.argv[2];
const pass = process.argv[3];

if (!user || !pass) {
    console.error('Usage: node init-admin.js <username> <password>');
    process.exit(1);
}

createAdmin(user, pass);
