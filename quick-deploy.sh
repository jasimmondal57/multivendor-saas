#!/bin/bash

# Quick Deployment Script - Manual Steps
# This script provides commands to copy-paste for manual deployment

set -e

SERVER="root@69.62.81.148"
SSH_KEY="~/.ssh/id_ed25519_marketplace"
APP_DIR="/var/www/multivendor-saas"

echo "=========================================="
echo "Multi-Vendor SaaS - Quick Deployment"
echo "=========================================="
echo ""
echo "Server: $SERVER"
echo "SSH Key: $SSH_KEY"
echo ""
echo "This script will guide you through the deployment process."
echo "Press Enter to continue..."
read

# Step 1: Test connection
echo ""
echo "=========================================="
echo "Step 1: Testing SSH Connection"
echo "=========================================="
echo "Running: ssh -i $SSH_KEY $SERVER 'echo Connection successful'"
ssh -i $SSH_KEY $SERVER 'echo "✓ Connection successful"'

# Step 2: Upload files
echo ""
echo "=========================================="
echo "Step 2: Uploading Application Files"
echo "=========================================="
echo "Creating application directory..."
ssh -i $SSH_KEY $SERVER "mkdir -p $APP_DIR"

echo "Uploading backend files..."
rsync -avz --progress -e "ssh -i $SSH_KEY" \
    --exclude='node_modules' \
    --exclude='vendor' \
    --exclude='storage/logs/*' \
    --exclude='storage/framework/cache/*' \
    --exclude='storage/framework/sessions/*' \
    --exclude='storage/framework/views/*' \
    --exclude='.env' \
    backend/ $SERVER:$APP_DIR/backend/

echo "Uploading frontend files..."
rsync -avz --progress -e "ssh -i $SSH_KEY" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.env.local' \
    frontend/ $SERVER:$APP_DIR/frontend/

echo "Uploading deployment scripts..."
rsync -avz --progress -e "ssh -i $SSH_KEY" \
    deploy-scripts/ $SERVER:$APP_DIR/scripts/

echo "✓ Files uploaded successfully"

# Step 3: Run server setup
echo ""
echo "=========================================="
echo "Step 3: Installing Server Dependencies"
echo "=========================================="
echo "This will install PHP 8.3, Node.js, PostgreSQL, Redis, Nginx, etc."
echo "This may take 5-10 minutes..."
echo "Press Enter to continue..."
read

ssh -i $SSH_KEY $SERVER "bash $APP_DIR/scripts/server-setup.sh"

# Step 4: Setup database
echo ""
echo "=========================================="
echo "Step 4: Setting Up Database"
echo "=========================================="
echo "Creating PostgreSQL database and user..."

DB_PASSWORD=$(openssl rand -base64 24)
echo "Generated database password: $DB_PASSWORD"
echo "SAVE THIS PASSWORD!"

ssh -i $SSH_KEY $SERVER <<ENDSSH
sudo -u postgres psql <<EOF
DROP DATABASE IF EXISTS multivendor_saas;
DROP USER IF EXISTS multivendor_user;
CREATE USER multivendor_user WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE multivendor_saas OWNER multivendor_user;
GRANT ALL PRIVILEGES ON DATABASE multivendor_saas TO multivendor_user;
\q
EOF
ENDSSH

echo "✓ Database created"

# Step 5: Configure backend
echo ""
echo "=========================================="
echo "Step 5: Configuring Backend (Laravel)"
echo "=========================================="

ssh -i $SSH_KEY $SERVER <<ENDSSH
cd $APP_DIR/backend

# Create .env file
cat > .env <<EOF
APP_NAME="Multi-Vendor SaaS"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=http://69.62.81.148

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=multivendor_saas
DB_USERNAME=multivendor_user
DB_PASSWORD=$DB_PASSWORD

CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls

PLATFORM_COMMISSION_PERCENTAGE=10
TDS_PERCENTAGE=1
COMMISSION_GST_PERCENTAGE=18
RETURN_SHIPPING_FEE=150
RETURN_PERIOD_DAYS=30
EOF

# Install dependencies
echo "Installing Composer dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction

# Generate key
php artisan key:generate --force

# Set permissions
chown -R www-data:www-data $APP_DIR/backend
chmod -R 755 $APP_DIR/backend
chmod -R 775 $APP_DIR/backend/storage
chmod -R 775 $APP_DIR/backend/bootstrap/cache

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Seed database
echo "Seeding database..."
php artisan db:seed --force

# Optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✓ Backend configured"
ENDSSH

# Step 6: Configure frontend
echo ""
echo "=========================================="
echo "Step 6: Configuring Frontend (Next.js)"
echo "=========================================="

ssh -i $SSH_KEY $SERVER <<ENDSSH
cd $APP_DIR/frontend

# Create .env.local
cat > .env.local <<EOF
NEXT_PUBLIC_API_URL=http://69.62.81.148/api/v1
NEXT_PUBLIC_ADMIN_API_URL=http://69.62.81.148/api/admin
NEXT_PUBLIC_APP_NAME=Multi-Vendor SaaS
NEXT_PUBLIC_APP_URL=http://69.62.81.148:3000
EOF

# Install dependencies
echo "Installing npm dependencies..."
npm install

# Build
echo "Building Next.js application..."
npm run build

# Install PM2
npm install -g pm2

# Create PM2 config
cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'multivendor-frontend',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '$APP_DIR/frontend',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# Start with PM2
pm2 delete multivendor-frontend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root

echo "✓ Frontend configured"
ENDSSH

# Step 7: Configure Nginx
echo ""
echo "=========================================="
echo "Step 7: Configuring Nginx"
echo "=========================================="

ssh -i $SSH_KEY $SERVER <<'ENDSSH'
cat > /etc/nginx/sites-available/multivendor-saas <<'EOF'
server {
    listen 80;
    server_name 69.62.81.148;
    
    root /var/www/multivendor-saas/backend/public;
    index index.php;

    client_max_body_size 100M;

    location /api {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_read_timeout 300;
    }

    location ~ /\. {
        deny all;
    }
}
EOF

rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/multivendor-saas /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

echo "✓ Nginx configured"
ENDSSH

# Step 8: Setup queue workers
echo ""
echo "=========================================="
echo "Step 8: Setting Up Queue Workers"
echo "=========================================="

ssh -i $SSH_KEY $SERVER <<ENDSSH
cat > /etc/supervisor/conf.d/laravel-worker.conf <<EOF
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php $APP_DIR/backend/artisan queue:work redis --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=$APP_DIR/backend/storage/logs/worker.log
EOF

supervisorctl reread
supervisorctl update
supervisorctl start laravel-worker:*

echo "✓ Queue workers started"
ENDSSH

# Final summary
echo ""
echo "=========================================="
echo "✓ DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "=========================================="
echo ""
echo "Your application is now running:"
echo ""
echo "  Frontend: http://69.62.81.148:3000"
echo "  Backend API: http://69.62.81.148/api"
echo ""
echo "Default Admin Credentials:"
echo "  Email: admin@example.com"
echo "  Password: password"
echo ""
echo "Database Credentials:"
echo "  Database: multivendor_saas"
echo "  User: multivendor_user"
echo "  Password: $DB_PASSWORD"
echo ""
echo "IMPORTANT: Save the database password above!"
echo ""
echo "Next Steps:"
echo "  1. Change default admin password"
echo "  2. Configure email settings in backend/.env"
echo "  3. Configure WhatsApp API credentials"
echo "  4. Configure Delhivery API credentials"
echo ""
echo "=========================================="

