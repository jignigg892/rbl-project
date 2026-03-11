require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());
app.use(cors());

// Request size limits (prevent payload flooding)
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));

// Basic rate limiter (in-memory, per-IP)
const rateLimitMap = new Map();
app.use((req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 100;

    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, { count: 1, start: now });
    } else {
        const entry = rateLimitMap.get(ip);
        if (now - entry.start > windowMs) {
            rateLimitMap.set(ip, { count: 1, start: now });
        } else {
            entry.count++;
            if (entry.count > maxRequests) {
                return res.status(429).json({ message: 'Too many requests' });
            }
        }
    }
    next();
});

// Cleanup stale rate limit entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of rateLimitMap) {
        if (now - entry.start > 300000) rateLimitMap.delete(ip);
    }
}, 300000);

// Routes
const applicationRoutes = require('./routes/applicationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');

app.use('/api/application', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Secure Credit Card API is healthy.' });
});

app.get('/', (req, res) => {
    res.json({ message: 'Secure Credit Card API is running.' });
});

// Load models after dotenv is ready
const db = require('./models');

// Database Sync & Server Start
db.sequelize.sync({ alter: true }).then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Database sync failed');
});
