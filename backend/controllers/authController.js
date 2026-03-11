const { Admin } = require('../models');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Credentials required' });
    }

    try {
        const admin = await Admin.findOne({ where: { username } });
        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'Server misconfigured' });
        }

        const token = jwt.sign(
            { id: admin.id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );

        await admin.update({ lastLogin: new Date() });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Authentication failed' });
    }
};
