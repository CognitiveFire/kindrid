const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/health', (req, res) => {
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
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Health Check</title>
        <meta charset="utf-8">
    </head>
    <body>
        <h1 style="color: green;">✅ Healthy</h1>
        <p>Kindrid app is running successfully</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
        <p>Port: ${PORT}</p>
        <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
        <p>Railway: ${process.env.RAILWAY_ENVIRONMENT ? 'Yes' : 'No'}</p>
    </body>
    </html>
  `);
});

// Serve static files from the public directory first (for health.html)
app.use(express.static(path.join(__dirname, 'public')));

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Serve the React app for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Serve the React app for other routes (but be more specific)
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
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// Start server immediately
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check available at /health and /health.html`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'dist')}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌍 Railway deployment ready!`);
  console.log(`✅ Health checks should work immediately`);
});
