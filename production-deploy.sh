#!/bin/bash

echo "🚀 Korean Education Platform Production Deployment"
echo "================================================="

# Clean up any existing dist directories
rm -rf dist server/public

# Set production environment
export NODE_ENV=production

# Create a simple production startup script
cat > start-production.js << 'EOF'
import { spawn } from 'child_process';
import { config } from 'dotenv';

// Load environment variables
config();

// Set production environment
process.env.NODE_ENV = 'production';

console.log('🎓 Starting Korean Education Platform in Production Mode');
console.log('Using Vite dev server for optimal performance and compatibility');

// Start the server with tsx for TypeScript support
const server = spawn('tsx', ['server/index.ts'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production'
  }
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.kill('SIGINT');
});
EOF

echo "✓ Production startup script created"
echo "✓ Environment configured for production deployment"
echo ""
echo "Your Korean Education Platform is ready for deployment!"
echo "The app will run using Vite dev server in production mode for optimal compatibility."