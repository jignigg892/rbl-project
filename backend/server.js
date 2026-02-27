const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet());
app.use(cors());

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const applicationRoutes = require('./routes/applicationRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/application', applicationRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Secure Credit Card API is healthy.' });
});

app.get('/', (req, res) => {
    res.json({ message: 'Secure Credit Card API is running.' });
});

// Server Start
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
