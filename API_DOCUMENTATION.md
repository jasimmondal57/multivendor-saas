# 📚 API Documentation

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer {token}
```

---

## 🔐 **Authentication Endpoints**

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "customer" // or "vendor"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "user": {...},
    "token": "1|xxxxx..."
  }
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer {token}
```

### Get Current User
```http
GET /auth/user
Authorization: Bearer {token}
```

---

## 🛍️ **Product Endpoints**

### Get All Products
```http
GET /products?page=1&per_page=12&category=electronics&min_price=1000&max_price=50000&sort=price_asc

Response:
{
  "success": true,
  "data": {
    "data": [...],
    "current_page": 1,
    "total": 100
  }
}
```

### Get Featured Products
```http
GET /products/featured
```

### Get Product by Slug
```http
GET /products/{slug}
```

### Get Categories
```http
GET /categories
```

---

## 📦 **Order Endpoints (Customer)**

### Get My Orders
```http
GET /customer/orders
Authorization: Bearer {token}
```

### Get Order Details
```http
GET /customer/orders/{id}
Authorization: Bearer {token}
```

### Create Order
```http
POST /customer/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ],
  "shipping_name": "John Doe",
  "shipping_phone": "9876543210",
  "shipping_email": "john@example.com",
  "shipping_address": "123 Main St",
  "shipping_city": "Mumbai",
  "shipping_state": "Maharashtra",
  "shipping_pincode": "400001",
  "payment_method": "cod", // cod, online, wallet, upi
  "customer_notes": "Please deliver before 5 PM"
}

Response:
{
  "success": true,
  "data": {
    "order_number": "ORD-XXXXXXXXXX",
    "total_amount": "5000.00",
    ...
  }
}
```

### Cancel Order
```http
POST /customer/orders/{id}/cancel
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Changed my mind"
}
```

### Track Order
```http
GET /customer/orders/{id}/track
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "order": {...},
    "timeline": [
      {
        "status": "Order Placed",
        "date": "2025-10-29 10:30 AM",
        "completed": true
      },
      ...
    ]
  }
}
```

---

## 🏪 **Vendor Order Endpoints**

### Get Vendor Orders
```http
GET /vendor/orders?status=pending
Authorization: Bearer {token}
```

### Get Vendor Order Details
```http
GET /vendor/orders/{id}
Authorization: Bearer {token}
```

### Update Order Item Status
```http
PUT /vendor/orders/{orderId}/items/{itemId}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "processing" // confirmed, processing, ready_for_pickup, shipped
}
```

### Mark Order Ready for Pickup
```http
POST /vendor/orders/{id}/ready-for-pickup
Authorization: Bearer {token}
```

### Get Vendor Statistics
```http
GET /vendor/orders/statistics
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "total_orders": 150,
    "pending_orders": 10,
    "processing_orders": 5,
    "completed_orders": 135,
    "total_revenue": "125000.00"
  }
}
```

---

## ⭐ **Review Endpoints**

### Get Product Reviews
```http
GET /products/{productId}/reviews?page=1

Response:
{
  "success": true,
  "data": {
    "reviews": {...},
    "stats": {
      "average_rating": 4.5,
      "total_reviews": 100,
      "five_star": 60,
      "four_star": 25,
      "three_star": 10,
      "two_star": 3,
      "one_star": 2
    }
  }
}
```

### Create Review
```http
POST /customer/reviews
Authorization: Bearer {token}
Content-Type: application/json

{
  "product_id": 1,
  "order_id": 5, // optional
  "rating": 5,
  "title": "Excellent product!",
  "comment": "Very satisfied with the quality",
  "images": ["https://..."] // optional
}
```

### Update Review
```http
PUT /customer/reviews/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "rating": 4,
  "comment": "Updated review"
}
```

### Delete Review
```http
DELETE /customer/reviews/{id}
Authorization: Bearer {token}
```

### Mark Review as Helpful
```http
POST /customer/reviews/{id}/helpful
Authorization: Bearer {token}
Content-Type: application/json

{
  "is_helpful": true // or false
}
```

### Vendor Response to Review
```http
POST /vendor/reviews/{id}/response
Authorization: Bearer {token}
Content-Type: application/json

{
  "response": "Thank you for your feedback!"
}
```

---

## ❤️ **Wishlist Endpoints**

### Get Wishlist
```http
GET /customer/wishlist
Authorization: Bearer {token}
```

### Add to Wishlist
```http
POST /customer/wishlist
Authorization: Bearer {token}
Content-Type: application/json

{
  "product_id": 1
}
```

### Remove from Wishlist
```http
DELETE /customer/wishlist/{productId}
Authorization: Bearer {token}
```

### Check if Product in Wishlist
```http
GET /customer/wishlist/check/{productId}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "in_wishlist": true
  }
}
```

---

## 🎟️ **Coupon Endpoints**

### Get All Active Coupons
```http
GET /coupons
```

### Validate Coupon
```http
POST /customer/coupons/validate
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "SAVE20",
  "order_amount": 5000,
  "product_ids": [1, 2, 3],
  "category_ids": [1, 2]
}

Response:
{
  "success": true,
  "message": "Coupon applied successfully",
  "data": {
    "coupon": {...},
    "discount_amount": 1000,
    "final_amount": 4000
  }
}
```

### Create Coupon (Admin)
```http
POST /admin/coupons
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "SAVE20",
  "name": "20% Off",
  "description": "Get 20% off on all products",
  "type": "percentage", // percentage, fixed, free_shipping
  "value": 20,
  "min_order_amount": 1000,
  "max_discount_amount": 500,
  "usage_limit": 100,
  "usage_limit_per_user": 1,
  "valid_from": "2025-10-29",
  "valid_until": "2025-11-30",
  "applicable_categories": [1, 2],
  "applicable_products": [1, 2, 3]
}
```

---

## 🔔 **Notification Endpoints**

### Get Notifications
```http
GET /customer/notifications?page=1
Authorization: Bearer {token}
```

### Mark Notification as Read
```http
POST /customer/notifications/{id}/read
Authorization: Bearer {token}
```

### Mark All as Read
```http
POST /customer/notifications/read-all
Authorization: Bearer {token}
```

### Get Unread Count
```http
GET /customer/notifications/unread-count
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "unread_count": 5
  }
}
```

---

## 📸 **Image Upload Endpoints**

### Upload Product Image
```http
POST /vendor/images/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

image: [file]

Response:
{
  "success": true,
  "data": {
    "url": "http://localhost:8000/storage/uploads/xxxxx.jpg"
  }
}
```

### Upload Multiple Images
```http
POST /vendor/images/upload-multiple
Authorization: Bearer {token}
Content-Type: multipart/form-data

images[]: [file1]
images[]: [file2]
```

### Delete Image
```http
DELETE /vendor/images/delete
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "http://localhost:8000/storage/uploads/xxxxx.jpg"
}
```

---

## 🏥 **Health Check**

```http
GET /health

Response:
{
  "success": true,
  "message": "API is running",
  "timestamp": "2025-10-29 10:30:00"
}
```

---

## 📊 **Response Format**

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": {...} // validation errors
}
```

---

## 🔑 **Status Codes**

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

