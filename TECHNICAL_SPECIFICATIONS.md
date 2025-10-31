# 🔧 Technical Specifications Document

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Customer   │  │    Vendor    │  │    Admin     │      │
│  │   Frontend   │  │   Frontend   │  │   Frontend   │      │
│  │  (Next.js)   │  │  (Next.js)   │  │  (Next.js)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway Layer                          │
│                    (Nginx + Laravel)                         │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Rate Limiting │ CORS │ Authentication │ Logging   │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Application Layer (Laravel)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │     Auth     │  │   Product    │  │    Order     │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Payment    │  │   Shipping   │  │  Notification│      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │     Redis    │  │ Meilisearch  │      │
│  │  (Primary)   │  │ (Cache/Queue)│  │   (Search)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐                                           │
│  │   AWS S3     │                                           │
│  │  (Storage)   │                                           │
│  └──────────────┘                                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              External Services Integration                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Razorpay   │  │  Shiprocket  │  │   Gupshup    │      │
│  │   (Payment)  │  │  (Shipping)  │  │  (WhatsApp)  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Signzy    │  │   AWS SES    │  │    Sentry    │      │
│  │    (KYC)     │  │   (Email)    │  │   (Errors)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Microservices Architecture (Future Scalability)

While starting as a monolith, the architecture is designed to be split into microservices:

1. **Auth Service** - User authentication and authorization
2. **Vendor Service** - Vendor management and KYC
3. **Product Service** - Catalog and inventory management
4. **Order Service** - Order processing and management
5. **Payment Service** - Payment processing and splits
6. **Shipping Service** - Logistics and tracking
7. **Notification Service** - Email, WhatsApp, SMS
8. **Analytics Service** - Reporting and analytics

---

## 2. Database Design

### 2.1 Database Schema Overview

**Total Tables:** 50+  
**Database Engine:** PostgreSQL 15+  
**Indexing Strategy:** B-tree indexes on foreign keys, unique constraints, and frequently queried columns  
**Partitioning:** Order tables partitioned by date (monthly)

### 2.2 Key Relationships

```
users (1) ──────────── (1) vendors
  │                         │
  │                         │
  │                         │ (1)
  │                         │
  │                         ▼
  │                    vendor_stores (1) ──── (N) products
  │                                                  │
  │                                                  │ (1)
  │                                                  │
  │ (N)                                              ▼
  │                                            product_variants (N)
  │                                                  │
  │                                                  │
  ▼                                                  │
orders (N) ──── (N) order_items ◄──────────────────┘
  │
  │ (1)
  │
  ▼
order_payments (N)
  │
  │ (1)
  │
  ▼
payment_splits (N)
```

### 2.3 Critical Tables Structure

#### users
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP,
    phone VARCHAR(20) UNIQUE NOT NULL,
    phone_verified_at TIMESTAMP,
    password VARCHAR(255) NOT NULL,
    two_factor_secret TEXT,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active', -- active, suspended, banned
    last_login_at TIMESTAMP,
    last_login_ip INET,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status);
```

#### vendors
```sql
CREATE TABLE vendors (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(50), -- proprietorship, partnership, pvt_ltd, llp
    pan_number VARCHAR(10) UNIQUE NOT NULL,
    gstin VARCHAR(15) UNIQUE,
    gst_exempt BOOLEAN DEFAULT FALSE,
    gst_exempt_reason TEXT,
    verification_status VARCHAR(20) DEFAULT 'pending', -- pending, verified, rejected
    verification_notes TEXT,
    verified_at TIMESTAMP,
    verified_by BIGINT REFERENCES users(id),
    performance_tier VARCHAR(20) DEFAULT 'bronze', -- bronze, silver, gold
    commission_override DECIMAL(5,2), -- NULL means use default
    subscription_plan_id BIGINT,
    subscription_status VARCHAR(20) DEFAULT 'trial', -- trial, active, expired, cancelled
    subscription_expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_vendors_user_id ON vendors(user_id);
CREATE INDEX idx_vendors_verification_status ON vendors(verification_status);
CREATE INDEX idx_vendors_performance_tier ON vendors(performance_tier);
```

#### products
```sql
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    vendor_id BIGINT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES categories(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    product_type VARCHAR(20) DEFAULT 'simple', -- simple, configurable, digital
    sku VARCHAR(100) UNIQUE,
    hsn_code VARCHAR(8) NOT NULL,
    gst_rate DECIMAL(5,2) NOT NULL,
    mrp DECIMAL(10,2) NOT NULL,
    selling_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    weight DECIMAL(8,2), -- in grams
    length DECIMAL(8,2), -- in cm
    width DECIMAL(8,2),
    height DECIMAL(8,2),
    status VARCHAR(20) DEFAULT 'draft', -- draft, pending, approved, rejected, active, inactive
    approval_status VARCHAR(20) DEFAULT 'pending',
    approved_by BIGINT REFERENCES users(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    is_cod_available BOOLEAN DEFAULT TRUE,
    is_returnable BOOLEAN DEFAULT TRUE,
    return_window_days INT DEFAULT 7,
    meta_title VARCHAR(60),
    meta_description VARCHAR(160),
    views_count INT DEFAULT 0,
    sales_count INT DEFAULT 0,
    rating_avg DECIMAL(3,2) DEFAULT 0,
    rating_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_approval_status ON products(approval_status);
CREATE INDEX idx_products_selling_price ON products(selling_price);
```

#### orders
```sql
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    uuid UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    order_number VARCHAR(20) UNIQUE NOT NULL,
    user_id BIGINT REFERENCES users(id),
    guest_email VARCHAR(255),
    guest_phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, processing, shipped, delivered, cancelled, refunded
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed, refunded
    payment_method VARCHAR(50), -- razorpay, payu, cod, wallet
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_total DECIMAL(10,2) DEFAULT 0,
    tax_total DECIMAL(10,2) DEFAULT 0,
    discount_total DECIMAL(10,2) DEFAULT 0,
    wallet_used DECIMAL(10,2) DEFAULT 0,
    grand_total DECIMAL(10,2) NOT NULL,
    coupon_code VARCHAR(50),
    coupon_discount DECIMAL(10,2) DEFAULT 0,
    shipping_address_id BIGINT REFERENCES user_addresses(id),
    billing_address_id BIGINT REFERENCES user_addresses(id),
    notes TEXT,
    customer_ip INET,
    user_agent TEXT,
    placed_at TIMESTAMP,
    confirmed_at TIMESTAMP,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE orders_2024_01 PARTITION OF orders
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

---

## 3. API Design

### 3.1 API Versioning

All APIs are versioned using URL path versioning:
```
https://api.yourplatform.com/api/v1/...
```

### 3.2 Authentication

**Method:** Laravel Sanctum (Token-based)

**Headers:**
```
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

### 3.3 Response Format

**Success Response:**
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful",
  "meta": {
    "current_page": 1,
    "total_pages": 10,
    "per_page": 20,
    "total": 200
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The given data was invalid.",
    "errors": {
      "email": ["The email field is required."]
    }
  }
}
```

### 3.4 Rate Limiting

- **Authenticated Users:** 120 requests/minute
- **Guest Users:** 60 requests/minute
- **Admin Users:** 300 requests/minute

### 3.5 Pagination

All list endpoints support pagination:
```
GET /api/v1/products?page=1&per_page=20
```

### 3.6 Filtering & Sorting

```
GET /api/v1/products?filter[category]=electronics&filter[price_min]=1000&sort=-created_at
```

---

## 4. Security Specifications

### 4.1 Authentication & Authorization

- **Password Hashing:** bcrypt (cost factor: 12)
- **Token Expiry:** 24 hours (configurable)
- **2FA:** TOTP-based (Google Authenticator compatible)
- **Role-Based Access Control (RBAC):** Using Spatie Laravel Permission

### 4.2 Data Protection

- **Encryption at Rest:** Database encryption for sensitive fields (PAN, Aadhaar, Bank Account)
- **Encryption in Transit:** TLS 1.3
- **PII Data:** Encrypted using Laravel's encryption
- **File Upload:** Virus scanning using ClamAV

### 4.3 Security Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

### 4.4 Input Validation

- All inputs validated using Laravel Form Requests
- XSS protection enabled
- SQL injection prevention (Eloquent ORM)
- CSRF protection for web routes

---

## 5. Performance Specifications

### 5.1 Performance Targets

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| API Response Time (avg) | < 200ms | < 500ms |
| Database Query Time | < 50ms | < 100ms |
| Page Load Time (FCP) | < 1.5s | < 3s |
| Time to Interactive (TTI) | < 3s | < 5s |
| Lighthouse Score | > 90 | > 80 |

### 5.2 Caching Strategy

**Redis Cache Layers:**
1. **Application Cache:** User sessions, configuration
2. **Query Cache:** Frequently accessed database queries (categories, settings)
3. **API Response Cache:** Product listings, category trees
4. **Page Cache:** Static pages (Next.js ISR)

**Cache TTL:**
- User sessions: 24 hours
- Product listings: 5 minutes
- Category tree: 1 hour
- Settings: 1 hour

### 5.3 Database Optimization

- **Connection Pooling:** PgBouncer
- **Query Optimization:** Eager loading, index optimization
- **Read Replicas:** For analytics and reporting
- **Partitioning:** Orders table by month

---

## 6. Scalability Specifications

### 6.1 Horizontal Scaling

- **Application Servers:** Auto-scaling based on CPU (target: 70%)
- **Database:** Master-slave replication
- **File Storage:** S3 with CloudFront CDN
- **Queue Workers:** Auto-scaling based on queue depth

### 6.2 Load Balancing

- **Algorithm:** Round-robin with health checks
- **Session Affinity:** Not required (stateless API)
- **Health Check Endpoint:** `/api/health`

### 6.3 Expected Load

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Active Vendors | 500 | 2,000 | 5,000 |
| Active Customers | 10,000 | 50,000 | 200,000 |
| Daily Orders | 500 | 2,500 | 10,000 |
| Products | 50,000 | 200,000 | 1,000,000 |
| API Requests/day | 1M | 5M | 20M |

---

## 7. Monitoring & Logging

### 7.1 Application Monitoring

- **APM:** New Relic / DataDog
- **Error Tracking:** Sentry
- **Uptime Monitoring:** Pingdom / UptimeRobot
- **Log Aggregation:** ELK Stack (Elasticsearch, Logstash, Kibana)

### 7.2 Metrics to Track

- API response times
- Database query performance
- Queue job processing time
- Error rates
- User activity
- Business metrics (GMV, conversion rate)

### 7.3 Alerting

**Critical Alerts (Immediate):**
- Payment gateway failures
- Database connection failures
- API downtime
- High error rates (> 5%)

**Warning Alerts (15 minutes):**
- High response times (> 500ms)
- Queue backlog (> 1000 jobs)
- Disk space (> 80%)

---

## 8. Backup & Disaster Recovery

### 8.1 Backup Strategy

- **Database:** Automated daily backups (retained for 30 days)
- **Point-in-time Recovery:** Enabled (7 days)
- **File Storage:** S3 versioning enabled
- **Code:** Git repository with tags for releases

### 8.2 Recovery Time Objectives

- **RTO (Recovery Time Objective):** 4 hours
- **RPO (Recovery Point Objective):** 1 hour

---

## 9. Compliance & Legal

### 9.1 Indian Regulations

- **GST Compliance:** Invoice generation, GSTR-1/3B reports
- **TDS Compliance:** Section 194-O implementation
- **Data Protection:** Personal data handling as per IT Act 2000
- **Payment Regulations:** RBI guidelines for payment aggregators

### 9.2 Terms & Policies

- Privacy Policy
- Terms of Service
- Refund & Cancellation Policy
- Shipping Policy
- Vendor Agreement
- Customer Agreement

---

## 10. Development Standards

### 10.1 Code Standards

- **PHP:** PSR-12 coding standard
- **TypeScript:** ESLint + Prettier
- **Git:** Conventional Commits
- **Branching:** GitFlow (main, develop, feature/*, hotfix/*)

### 10.2 Code Review Process

- All code must be reviewed before merge
- Minimum 1 approval required
- Automated tests must pass
- No merge conflicts

### 10.3 Documentation

- API documentation (OpenAPI/Swagger)
- Code comments for complex logic
- README for each major module
- Deployment documentation
