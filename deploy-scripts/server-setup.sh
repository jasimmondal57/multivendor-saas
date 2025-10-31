#!/bin/bash

# Server Setup Script
# Installs all required packages and configures the server

set -e

echo "=========================================="
echo "Server Setup - Installing Dependencies"
echo "=========================================="

# Update system
echo "[1/10] Updating system packages..."
apt-get update
apt-get upgrade -y

# Install basic utilities
echo "[2/10] Installing basic utilities..."
apt-get install -y curl wget git unzip software-properties-common

# Install PHP 8.3
echo "[3/10] Installing PHP 8.3..."
add-apt-repository ppa:ondrej/php -y
apt-get update
apt-get install -y php8.3 php8.3-fpm php8.3-cli php8.3-common php8.3-mysql php8.3-pgsql \
    php8.3-zip php8.3-gd php8.3-mbstring php8.3-curl php8.3-xml php8.3-bcmath \
    php8.3-redis php8.3-intl php8.3-soap

# Install Composer
echo "[4/10] Installing Composer..."
if [ ! -f /usr/local/bin/composer ]; then
    curl -sS https://getcomposer.org/installer | php
    mv composer.phar /usr/local/bin/composer
    chmod +x /usr/local/bin/composer
fi

# Install Node.js 20.x
echo "[5/10] Installing Node.js 20.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Install PostgreSQL 15
echo "[6/10] Installing PostgreSQL 15..."
if ! command -v psql &> /dev/null; then
    apt-get install -y postgresql-15 postgresql-contrib-15
    systemctl enable postgresql
    systemctl start postgresql
fi

# Install Redis
echo "[7/10] Installing Redis..."
apt-get install -y redis-server
systemctl enable redis-server
systemctl start redis-server

# Install Nginx
echo "[8/10] Installing Nginx..."
apt-get install -y nginx
systemctl enable nginx
systemctl start nginx

# Install Supervisor
echo "[9/10] Installing Supervisor..."
apt-get install -y supervisor
systemctl enable supervisor
systemctl start supervisor

# Install Certbot for SSL
echo "[10/10] Installing Certbot..."
apt-get install -y certbot python3-certbot-nginx

# Configure PHP
echo "Configuring PHP..."
sed -i 's/upload_max_filesize = .*/upload_max_filesize = 100M/' /etc/php/8.3/fpm/php.ini
sed -i 's/post_max_size = .*/post_max_size = 100M/' /etc/php/8.3/fpm/php.ini
sed -i 's/memory_limit = .*/memory_limit = 512M/' /etc/php/8.3/fpm/php.ini
sed -i 's/max_execution_time = .*/max_execution_time = 300/' /etc/php/8.3/fpm/php.ini

# Restart PHP-FPM
systemctl restart php8.3-fpm

echo "=========================================="
echo "Server setup completed successfully!"
echo "=========================================="
echo "Installed versions:"
php -v | head -n 1
node -v
npm -v
psql --version
redis-server --version | head -n 1
nginx -v
echo "=========================================="

