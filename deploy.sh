#!/bin/bash

# Multi-Vendor SaaS Deployment Script
# Server: 69.62.81.148
# User: root

set -e

echo "=========================================="
echo "Multi-Vendor SaaS Deployment Script"
echo "=========================================="

# Configuration
SERVER_IP="69.62.81.148"
SSH_KEY="~/.ssh/id_ed25519_marketplace"
DEPLOY_USER="root"
APP_NAME="multivendor-saas"
DOMAIN="your-domain.com"  # Update this with your actual domain
APP_DIR="/var/www/$APP_NAME"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[i]${NC} $1"
}

# Test SSH connection
print_info "Testing SSH connection..."
if ssh -i $SSH_KEY -o ConnectTimeout=10 $DEPLOY_USER@$SERVER_IP "echo 'Connection successful'" > /dev/null 2>&1; then
    print_status "SSH connection successful"
else
    print_error "SSH connection failed. Please check your SSH key and server access."
    exit 1
fi

# Create deployment package
print_info "Creating deployment package..."
cd "$(dirname "$0")"

# Create temporary directory for deployment
TEMP_DIR=$(mktemp -d)
print_info "Temporary directory: $TEMP_DIR"

# Copy backend files
print_info "Copying backend files..."
rsync -av --exclude='node_modules' --exclude='vendor' --exclude='storage/logs/*' --exclude='storage/framework/cache/*' --exclude='storage/framework/sessions/*' --exclude='storage/framework/views/*' --exclude='.env' backend/ $TEMP_DIR/backend/

# Copy frontend files
print_info "Copying frontend files..."
rsync -av --exclude='node_modules' --exclude='.next' --exclude='.env.local' frontend/ $TEMP_DIR/frontend/

# Copy deployment scripts
print_info "Copying deployment scripts..."
cp deploy-scripts/* $TEMP_DIR/ 2>/dev/null || true

# Upload to server
print_info "Uploading files to server..."
ssh -i $SSH_KEY $DEPLOY_USER@$SERVER_IP "mkdir -p $APP_DIR"
rsync -avz -e "ssh -i $SSH_KEY" $TEMP_DIR/ $DEPLOY_USER@$SERVER_IP:$APP_DIR/

# Run server setup
print_info "Running server setup..."
ssh -i $SSH_KEY $DEPLOY_USER@$SERVER_IP "bash $APP_DIR/server-setup.sh"

# Run backend deployment
print_info "Deploying backend..."
ssh -i $SSH_KEY $DEPLOY_USER@$SERVER_IP "bash $APP_DIR/deploy-backend.sh"

# Run frontend deployment
print_info "Deploying frontend..."
ssh -i $SSH_KEY $DEPLOY_USER@$SERVER_IP "bash $APP_DIR/deploy-frontend.sh"

# Cleanup
print_info "Cleaning up temporary files..."
rm -rf $TEMP_DIR

print_status "Deployment completed successfully!"
echo ""
echo "=========================================="
echo "Next Steps:"
echo "=========================================="
echo "1. Update your domain DNS to point to: $SERVER_IP"
echo "2. SSH to server and configure SSL:"
echo "   ssh -i $SSH_KEY $DEPLOY_USER@$SERVER_IP"
echo "   sudo certbot --nginx -d $DOMAIN"
echo "3. Access your application:"
echo "   Frontend: http://$SERVER_IP:3000"
echo "   Backend API: http://$SERVER_IP/api"
echo "=========================================="

