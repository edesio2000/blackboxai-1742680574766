const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { errorHandler } = require('./middleware/errorHandler');
const farmersRouter = require('./routes/farmers');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(morgan('dev')); // Request logging
app.use(cors({
    origin: '*', // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json()); // Parse JSON bodies

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// API Routes
app.use('/api/farmers', farmersRouter);

// Basic API root route
app.get('/api', (req, res) => {
    res.json({
        message: 'Farmer Data Management API',
        version: '1.0.0',
        endpoints: {
            farmers: '/api/farmers'
        }
    });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access the application at http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    // Don't exit the process in development
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
});

module.exports = app;