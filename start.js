#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🚀 Starting Kindrid server...');
console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🌍 Railway environment: ${process.env.RAILWAY_ENVIRONMENT ? 'Yes' : 'No'}`);

// Start the main server
const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'production' }
});

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

console.log('✅ Startup script completed, server should be running...');
