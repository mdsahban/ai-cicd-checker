const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;
const VERSION = '1.0.0';

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Root endpoint
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        version: VERSION
    });
});

// 404 Error handler
app.use((req, res, next) => {
    res.status(404).json({ error: 'Not Found' });
});

// Global Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Export app for testing, or start server if run directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
