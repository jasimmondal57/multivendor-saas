#!/bin/bash

# Frontend Deployment Script
# Deploys Next.js application

set -e

APP_DIR="/var/www/multivendor-saas"
FRONTEND_DIR="$APP_DIR/frontend"

echo "=========================================="
echo "Frontend Deployment - Next.js"
echo "=========================================="

# Navigate to frontend directory
cd $FRONTEND_DIR

# Create .env.local file
echo "[1/5] Creating .env.local file..."
cat > .env.local <<EOF
NEXT_PUBLIC_API_URL=http://69.62.81.148/api/v1
NEXT_PUBLIC_ADMIN_API_URL=http://69.62.81.148/api/admin
NEXT_PUBLIC_APP_NAME=Multi-Vendor SaaS
NEXT_PUBLIC_APP_URL=http://69.62.81.148:3000
EOF

# Install dependencies
echo "[2/5] Installing npm dependencies..."
npm install --production=false

# Build Next.js application
echo "[3/5] Building Next.js application..."
npm run build

# Install PM2 globally
echo "[4/5] Installing PM2..."
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'multivendor-frontend',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '$FRONTEND_DIR',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '$FRONTEND_DIR/logs/error.log',
    out_file: '$FRONTEND_DIR/logs/out.log',
    log_file: '$FRONTEND_DIR/logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Start application with PM2
echo "[5/5] Starting Next.js with PM2..."
pm2 delete multivendor-frontend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

echo "=========================================="
echo "Frontend deployment completed!"
echo "=========================================="
echo "Application running on: http://69.62.81.148:3000"
echo "PM2 status:"
pm2 status
echo "=========================================="

