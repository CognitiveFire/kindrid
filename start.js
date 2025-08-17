#!/usr/bin/env node

const { spawn } = require('child_process');
const http = require('http');

console.log('🚀 Starting Kindrid server with health check verification...');

// Start the main server
const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production' }
});

// Wait a moment for the server to start
setTimeout(() => {
  console.log('🔍 Verifying server is responding...');
  
  // Check if the server is responding
  const req = http.request({
    hostname: 'localhost',
    port: process.env.PORT || 3000,
    path: '/health.html',
    method: 'GET',
    timeout: 5000
  }, (res) => {
    console.log(`✅ Server is responding! Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log('🎉 Health check passed! Server is ready.');
    } else {
      console.log('⚠️  Server responded but with unexpected status code');
    }
  });

  req.on('error', (err) => {
    console.log('❌ Server not responding yet, will retry...');
    // Retry after a few more seconds
    setTimeout(() => {
      console.log('🔄 Retrying health check...');
      const retryReq = http.request({
        hostname: 'localhost',
        port: process.env.PORT || 3000,
        path: '/health.html',
        method: 'GET',
        timeout: 5000
      }, (res) => {
        console.log(`✅ Server is now responding! Status: ${res.statusCode}`);
      });
      
      retryReq.on('error', (retryErr) => {
        console.log('❌ Server still not responding after retry');
      });
      
      retryReq.end();
    }, 5000);
  });

  req.on('timeout', () => {
    console.log('⏰ Health check timed out');
    req.destroy();
  });

  req.end();
}, 2000);

// Handle server process events
server.on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`🛑 Server process exited with code ${code}`);
  process.exit(code);
});

// Handle process signals
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down...');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down...');
  server.kill('SIGINT');
});
