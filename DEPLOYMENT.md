# Multi-Vendor SaaS Deployment Guide

## Server Information
- **IP Address**: 69.62.81.148
- **SSH Key**: ~/.ssh/id_ed25519_marketplace
- **User**: root

## Quick Deployment (Automated)

### Option 1: One-Command Deployment
```bash
chmod +x deploy.sh
./deploy.sh
```

## Manual Deployment (Step by Step)

### Step 1: Connect to Server
```bash
ssh -i ~/.ssh/id_ed25519_marketplace root@69.62.81.148
```

### Step 2: Install System Dependencies
```bash
# Update system
apt-get update && apt-get upgrade -y

# Install basic utilities
apt-get install -y curl wget git unzip software-properties-common

# Install PHP 8.3
add-apt-repository ppa:ondrej/php -y
apt-get update
apt-get install -y php8.3 php8.3-fpm php8.3-cli php8.3-common php8.3-pgsql \
    php8.3-zip php8.3-gd php8.3-mbstring php8.3-curl php8.3-xml php8.3-bcmath \
    php8.3-redis php8.3-intl

# Install Composer
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer
chmod +x /usr/local/bin/composer

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PostgreSQL 15
apt-get install -y postgresql-15 postgresql-contrib-15

# Install Redis
apt-get install -y redis-server

# Install Nginx
apt-get install -y nginx

# Install Supervisor
apt-get install -y supervisor
```

### Step 3: Setup PostgreSQL Database
```bash
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE USER multivendor_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE multivendor_saas OWNER multivendor_user;
GRANT ALL PRIVILEGES ON DATABASE multivendor_saas TO multivendor_user;
\q
```

### Step 4: Upload Application Files
From your local machine:
```bash
# Create application directory on server
ssh -i ~/.ssh/id_ed25519_marketplace root@69.62.81.148 "mkdir -p /var/www/multivendor-saas"

# Upload backend
rsync -avz -e "ssh -i ~/.ssh/id_ed25519_marketplace" \
    --exclude='node_modules' --exclude='vendor' --exclude='storage/logs/*' \
    backend/ root@69.62.81.148:/var/www/multivendor-saas/backend/

# Upload frontend
rsync -avz -e "ssh -i ~/.ssh/id_ed25519_marketplace" \
    --exclude='node_modules' --exclude='.next' \
    frontend/ root@69.62.81.148:/var/www/multivendor-saas/frontend/
```

### Step 5: Configure Backend (Laravel)
On the server:
```bash
cd /var/www/multivendor-saas/backend

# Create .env file
cp .env.example .env
nano .env

# Update these values in .env:
# APP_ENV=production
# APP_DEBUG=false
# APP_URL=http://69.62.81.148
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=multivendor_saas
# DB_USERNAME=multivendor_user
# DB_PASSWORD=your_secure_password

# Install dependencies
composer install --no-dev --optimize-autoloader

# Generate app key
php artisan key:generate

# Set permissions
chown -R www-data:www-data /var/www/multivendor-saas/backend
chmod -R 755 /var/www/multivendor-saas/backend
chmod -R 775 /var/www/multivendor-saas/backend/storage
chmod -R 775 /var/www/multivendor-saas/backend/bootstrap/cache

# Run migrations
php artisan migrate --force

# Seed database
php artisan db:seed --force

# Optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Step 6: Configure Frontend (Next.js)
```bash
cd /var/www/multivendor-saas/frontend

# Create .env.local
cat > .env.local <<EOF
NEXT_PUBLIC_API_URL=http://69.62.81.148/api/v1
NEXT_PUBLIC_ADMIN_API_URL=http://69.62.81.148/api/admin
NEXT_PUBLIC_APP_NAME=Multi-Vendor SaaS
NEXT_PUBLIC_APP_URL=http://69.62.81.148:3000
EOF

# Install dependencies
npm install

# Build
npm run build

# Install PM2
npm install -g pm2

# Start with PM2
pm2 start npm --name "multivendor-frontend" -- start
pm2 save
pm2 startup
```

### Step 7: Configure Nginx
```bash
# Create Nginx config
nano /etc/nginx/sites-available/multivendor-saas
```

Paste this configuration:
```nginx
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
    }
}
```

Enable the site:
```bash
ln -s /etc/nginx/sites-available/multivendor-saas /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

### Step 8: Setup Queue Workers
```bash
# Create supervisor config
nano /etc/supervisor/conf.d/laravel-worker.conf
```

Paste:
```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/multivendor-saas/backend/artisan queue:work redis --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/multivendor-saas/backend/storage/logs/worker.log
```

Start workers:
```bash
supervisorctl reread
supervisorctl update
supervisorctl start laravel-worker:*
```

## Access Your Application

- **Frontend**: http://69.62.81.148:3000
- **Backend API**: http://69.62.81.148/api
- **Admin Panel**: http://69.62.81.148:3000/admin/dashboard

## Default Credentials (from DemoDataSeeder)

### Admin
- Email: admin@example.com
- Password: password

### Vendors
- Vendor 1: vendor1@example.com / password
- Vendor 2: vendor2@example.com / password
- Vendor 3: vendor3@example.com / password

### Customers
- Customer 1: customer1@example.com / password
- Customer 2: customer2@example.com / password

## Post-Deployment Tasks

1. **Change Default Passwords**: Immediately change all default passwords
2. **Configure Email**: Update MAIL_* settings in .env
3. **Configure WhatsApp**: Add WhatsApp API credentials
4. **Configure Delhivery**: Add Delhivery API credentials
5. **Setup SSL**: Use Let's Encrypt for HTTPS (if you have a domain)
6. **Setup Backups**: Configure automated database backups
7. **Monitor Logs**: 
   - Laravel: `/var/www/multivendor-saas/backend/storage/logs/laravel.log`
   - Nginx: `/var/log/nginx/`
   - PM2: `pm2 logs`

## Troubleshooting

### Check Service Status
```bash
systemctl status nginx
systemctl status php8.3-fpm
systemctl status postgresql
systemctl status redis-server
pm2 status
supervisorctl status
```

### View Logs
```bash
# Laravel logs
tail -f /var/www/multivendor-saas/backend/storage/logs/laravel.log

# Nginx logs
tail -f /var/log/nginx/error.log

# PM2 logs
pm2 logs multivendor-frontend
```

### Restart Services
```bash
systemctl restart nginx
systemctl restart php8.3-fpm
pm2 restart multivendor-frontend
supervisorctl restart laravel-worker:*
```

