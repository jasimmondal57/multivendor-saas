#!/bin/bash

# Configure Nginx for the application

set -e

APP_DIR="/var/www/multivendor-saas"

echo "=========================================="
echo "Configuring Nginx"
echo "=========================================="

# Copy nginx configuration
echo "Copying Nginx configuration..."
cp $APP_DIR/nginx-config.conf /etc/nginx/sites-available/multivendor-saas

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Enable site
ln -sf /etc/nginx/sites-available/multivendor-saas /etc/nginx/sites-enabled/

# Test nginx configuration
echo "Testing Nginx configuration..."
nginx -t

# Reload nginx
echo "Reloading Nginx..."
systemctl reload nginx

echo "=========================================="
echo "Nginx configured successfully!"
echo "=========================================="
echo "Backend API: http://69.62.81.148/api"
echo "Frontend: http://69.62.81.148:3000"
echo "=========================================="

