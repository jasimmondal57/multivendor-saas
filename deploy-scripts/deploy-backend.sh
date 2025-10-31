#!/bin/bash

# Backend Deployment Script
# Deploys Laravel application

set -e

APP_DIR="/var/www/multivendor-saas"
BACKEND_DIR="$APP_DIR/backend"
DB_NAME="multivendor_saas"
DB_USER="multivendor_user"
DB_PASSWORD=$(openssl rand -base64 32)

echo "=========================================="
echo "Backend Deployment - Laravel"
echo "=========================================="

# Create database and user
echo "[1/8] Setting up PostgreSQL database..."
sudo -u postgres psql <<EOF
-- Drop database if exists (for fresh deployment)
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;

-- Create user and database
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE $DB_NAME OWNER $DB_USER;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOF

echo "Database created: $DB_NAME"
echo "Database user: $DB_USER"
echo "Database password: $DB_PASSWORD"

# Navigate to backend directory
cd $BACKEND_DIR

# Create .env file
echo "[2/8] Creating .env file..."
cat > .env <<EOF
APP_NAME="Multi-Vendor SaaS"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=http://69.62.81.148

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=$DB_NAME
DB_USERNAME=$DB_USER
DB_PASSWORD=$DB_PASSWORD

BROADCAST_DRIVER=log
CACHE_DRIVER=redis
FILESYSTEM_DISK=local
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
SESSION_LIFETIME=120

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@example.com
MAIL_FROM_NAME="\${APP_NAME}"

# WhatsApp Configuration (Update with your credentials)
WHATSAPP_API_URL=https://graph.facebook.com/v17.0
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=

# Delhivery Configuration (Update with your credentials)
DELHIVERY_API_URL=https://track.delhivery.com/api
DELHIVERY_API_KEY=
DELHIVERY_CLIENT_NAME=

# Platform Settings
PLATFORM_COMMISSION_PERCENTAGE=10
TDS_PERCENTAGE=1
COMMISSION_GST_PERCENTAGE=18
RETURN_SHIPPING_FEE=150
RETURN_PERIOD_DAYS=30
EOF

# Install dependencies
echo "[3/8] Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction

# Generate application key
echo "[4/8] Generating application key..."
php artisan key:generate --force

# Set permissions
echo "[5/8] Setting permissions..."
chown -R www-data:www-data $BACKEND_DIR
chmod -R 755 $BACKEND_DIR
chmod -R 775 $BACKEND_DIR/storage
chmod -R 775 $BACKEND_DIR/bootstrap/cache

# Run migrations and seeders
echo "[6/8] Running database migrations..."
php artisan migrate --force

echo "[7/8] Seeding database..."
php artisan db:seed --force

# Optimize Laravel
echo "[8/8] Optimizing Laravel..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Create Laravel queue worker supervisor config
cat > /etc/supervisor/conf.d/laravel-worker.conf <<EOF
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php $BACKEND_DIR/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=$BACKEND_DIR/storage/logs/worker.log
stopwaitsecs=3600
EOF

# Reload supervisor
supervisorctl reread
supervisorctl update
supervisorctl start laravel-worker:*

echo "=========================================="
echo "Backend deployment completed!"
echo "=========================================="
echo "Database: $DB_NAME"
echo "Database User: $DB_USER"
echo "Database Password: $DB_PASSWORD"
echo ""
echo "IMPORTANT: Save these credentials securely!"
echo "=========================================="

