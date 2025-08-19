const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('Starting minimal server for Railway...');
console.log(`Port: ${PORT}`);
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Express version: ${require('express/package.json').version}`);

// Root path - serve the React app
app.get('/', (req, res) => {
  console.log('Root path requested - serving React app');
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Kindrid - Healthy</title>
        <meta charset="utf-8">
    </head>
    <body>
        <h1>✅ Kindrid is Running</h1>
        <p>Server is healthy and responding</p>
        <p>Port: ${PORT}</p>
        <p>Time: ${new Date().toISOString()}</p>
    </body>
    </html>
  `);
});

// Test endpoint
app.get('/test', (req, res) => {
  console.log('Test endpoint requested');
  res.status(200).json({ 
    message: 'Server is running', 
    time: new Date().toISOString(),
    port: PORT
  });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Root path: http://localhost:${PORT}/`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`🚀 Ready for Railway deployment!`);
});

// Error handling
server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
