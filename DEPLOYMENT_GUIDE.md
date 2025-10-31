# 🚀 DEPLOYMENT GUIDE

## Multi-Vendor E-Commerce Platform Deployment

This guide will help you deploy your multi-vendor e-commerce platform to production.

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### **1. Environment Configuration**

#### Backend (.env):
```env
APP_NAME="Multi-Vendor Marketplace"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=pgsql
DB_HOST=your-db-host
DB_PORT=5432
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

REDIS_HOST=your-redis-host
REDIS_PASSWORD=your-redis-password
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="${APP_NAME}"

# Razorpay (for payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# AWS S3 (for file storage)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_DEFAULT_REGION=ap-south-1
AWS_BUCKET=your_bucket_name

# Meilisearch (for search)
MEILISEARCH_HOST=http://your-meilisearch-host:7700
MEILISEARCH_KEY=your_master_key
```

#### Frontend (.env.local):
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

## 🐳 **DOCKER DEPLOYMENT**

### **1. Create docker-compose.production.yml**

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: multivendor_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  # Redis Cache
  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped

  # Meilisearch
  meilisearch:
    image: getmeili/meilisearch:latest
    environment:
      MEILI_MASTER_KEY: ${MEILISEARCH_KEY}
    volumes:
      - meilisearch_data:/meili_data
    restart: unless-stopped

  # Laravel Backend
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.production
    environment:
      - APP_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
      - MEILISEARCH_HOST=http://meilisearch:7700
    volumes:
      - ./backend:/var/www/html
      - backend_storage:/var/www/html/storage
    depends_on:
      - postgres
      - redis
      - meilisearch
    restart: unless-stopped

  # Next.js Frontend
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.production
    environment:
      - NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
    ports:
      - "3000:3000"
    restart: unless-stopped

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  meilisearch_data:
  backend_storage:
```

### **2. Create Backend Dockerfile**

Create `backend/Dockerfile.production`:

```dockerfile
FROM php:8.3-fpm

# Install dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libpq-dev

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . .

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Generate application key
RUN php artisan key:generate

# Run migrations
RUN php artisan migrate --force

# Optimize
RUN php artisan config:cache
RUN php artisan route:cache
RUN php artisan view:cache

EXPOSE 9000

CMD ["php-fpm"]
```

### **3. Create Frontend Dockerfile**

Create `frontend/Dockerfile.production`:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application files
COPY . .

# Build application
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy built files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
```

---

## ☁️ **CLOUD DEPLOYMENT OPTIONS**

### **Option 1: AWS (Recommended)**

#### Services Required:
- **EC2**: Application servers
- **RDS**: PostgreSQL database
- **ElastiCache**: Redis
- **S3**: File storage
- **CloudFront**: CDN
- **Route 53**: DNS
- **Certificate Manager**: SSL certificates
- **SES**: Email service

#### Steps:
1. Create RDS PostgreSQL instance
2. Create ElastiCache Redis cluster
3. Create S3 bucket for file uploads
4. Launch EC2 instances (t3.medium or larger)
5. Install Docker and Docker Compose
6. Clone repository
7. Configure environment variables
8. Run `docker-compose -f docker-compose.production.yml up -d`
9. Configure CloudFront for CDN
10. Set up Route 53 for DNS
11. Configure SSL with Certificate Manager

### **Option 2: DigitalOcean**

#### Services Required:
- **Droplets**: Application servers
- **Managed Database**: PostgreSQL
- **Spaces**: Object storage
- **Load Balancer**: Traffic distribution

#### Steps:
1. Create PostgreSQL managed database
2. Create Droplet (4GB RAM minimum)
3. Install Docker and Docker Compose
4. Clone repository
5. Configure environment variables
6. Run deployment
7. Set up Load Balancer
8. Configure DNS

### **Option 3: Vercel + Railway**

#### For Quick Deployment:
- **Frontend**: Deploy to Vercel
- **Backend**: Deploy to Railway
- **Database**: Railway PostgreSQL

#### Steps:
1. Push code to GitHub
2. Connect Vercel to frontend folder
3. Connect Railway to backend folder
4. Configure environment variables
5. Deploy

---

## 🔒 **SECURITY CHECKLIST**

### **1. SSL/TLS**
- ✅ Install SSL certificate (Let's Encrypt or paid)
- ✅ Force HTTPS redirect
- ✅ Enable HSTS headers

### **2. Environment**
- ✅ Set `APP_DEBUG=false`
- ✅ Set `APP_ENV=production`
- ✅ Use strong database passwords
- ✅ Rotate API keys regularly

### **3. Database**
- ✅ Enable SSL connections
- ✅ Restrict access by IP
- ✅ Regular backups
- ✅ Use read replicas for scaling

### **4. Application**
- ✅ Enable rate limiting
- ✅ Configure CORS properly
- ✅ Sanitize user inputs
- ✅ Enable CSRF protection

### **5. File Uploads**
- ✅ Validate file types
- ✅ Limit file sizes
- ✅ Store in S3 (not local)
- ✅ Scan for malware

---

## 📊 **MONITORING & LOGGING**

### **1. Application Monitoring**
- Install Laravel Telescope (development)
- Use New Relic or Datadog (production)
- Set up error tracking (Sentry)

### **2. Server Monitoring**
- CPU, Memory, Disk usage
- Network traffic
- Database connections
- Redis memory

### **3. Logging**
- Centralized logging (ELK Stack or CloudWatch)
- Error logs
- Access logs
- Audit logs

---

## 🔄 **CI/CD PIPELINE**

### **GitHub Actions Example**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy Backend
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/multivendor
            git pull origin main
            cd backend
            composer install --no-dev
            php artisan migrate --force
            php artisan config:cache
            php artisan route:cache
            php artisan view:cache
            
      - name: Deploy Frontend
        run: |
          cd frontend
          npm ci
          npm run build
          # Deploy to Vercel or your hosting
```

---

## 🚀 **POST-DEPLOYMENT**

### **1. Verify Deployment**
- ✅ Check all pages load correctly
- ✅ Test user registration and login
- ✅ Test product listing and search
- ✅ Test cart and checkout
- ✅ Test order placement
- ✅ Test vendor dashboard
- ✅ Test admin dashboard

### **2. Performance Optimization**
- ✅ Enable Redis caching
- ✅ Configure CDN
- ✅ Optimize images
- ✅ Enable gzip compression
- ✅ Minify CSS/JS

### **3. Backup Strategy**
- ✅ Daily database backups
- ✅ Weekly full backups
- ✅ Store backups in S3
- ✅ Test restore process

---

## 📞 **SUPPORT & MAINTENANCE**

### **Regular Tasks**
- Monitor error logs daily
- Review performance metrics weekly
- Update dependencies monthly
- Security audits quarterly
- Backup verification monthly

### **Scaling Considerations**
- Add more EC2 instances
- Use load balancer
- Implement database read replicas
- Use Redis cluster
- Enable auto-scaling

---

## 🎉 **CONGRATULATIONS!**

Your multi-vendor e-commerce platform is now deployed and ready for production use!

For support, refer to:
- `FEATURES_COMPLETED.md` - Feature documentation
- `API_DOCUMENTATION.md` - API reference
- `FINAL_SUMMARY.md` - Project overview

