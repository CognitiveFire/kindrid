const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting Kindrid server...');
console.log(`📁 Current directory: ${__dirname}`);
console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌍 Railway environment: ${process.env.RAILWAY_ENVIRONMENT ? 'Yes' : 'No'}`);

// Health check endpoint - respond immediately
app.get('/health', (req, res) => {
  console.log('✅ Health check requested at /health');
  res.status(200).json({ 
    status: 'healthy', 
    message: 'Kindrid app is running successfully',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    railway: process.env.RAILWAY_ENVIRONMENT ? 'true' : 'false'
  });
});

app.get('/health.html', (req, res) => {
  console.log('✅ Health check requested at /health.html');
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Health Check</title>
        <meta charset="utf-8">
    </head>
    <body>
        <h1>Healthy</h1>
        <p>OK</p>
        <p>Server running on port ${PORT}</p>
        <p>Time: ${new Date().toISOString()}</p>
    </body>
    </html>
  `);
});

// Test endpoint to verify server is responding
app.get('/test', (req, res) => {
  console.log('🧪 Test endpoint requested');
  res.status(200).json({ message: 'Server is responding!', time: new Date().toISOString() });
});

// Serve static files from the dist directory
console.log(`📁 Serving dist directory from: ${path.join(__dirname, 'dist')}`);
app.use(express.static(path.join(__dirname, 'dist')));

// Serve the React app for the root route
app.get('/', (req, res) => {
  console.log('🏠 Root route requested');
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Serve the React app for other routes
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/ai-tools', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/controls', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler for unmatched routes
app.use('*', (req, res) => {
  console.log(`❌ 404 for route: ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// Start server immediately
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check available at /health and /health.html`);
  console.log(`🧪 Test endpoint available at /test`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'dist')}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌍 Railway deployment ready!`);
  console.log(`✅ Health checks should work immediately`);
  console.log(`⏰ Server started at: ${new Date().toISOString()}`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

// Handle process errors
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
