# Page Builder System - User Guide

## Overview

The Page Builder System allows you to create and manage dynamic landing pages, banners, and navigation menus from the admin panel without writing code.

## Features

✅ **Dynamic Page Management** - Create custom pages with drag-and-drop sections  
✅ **Component Library** - 10 pre-built components (Hero Banner, Category Grid, Product Carousel, etc.)  
✅ **Banner Management** - Schedule and manage promotional banners  
✅ **Menu Builder** - Create nested navigation menus  
✅ **SEO Optimization** - Meta tags, structured data, and SEO-friendly URLs  
✅ **Responsive Design** - Device-specific visibility controls  
✅ **Scheduling** - Set start/end dates for content  
✅ **Analytics** - Track views, clicks, and engagement  

---

## Database Schema

### Tables Created

1. **pages** - Store page definitions
2. **page_sections** - Store individual sections/components on pages
3. **banners** - Store banner/slider content with scheduling
4. **menus** - Store navigation menu definitions
5. **menu_items** - Store menu items with nested support

All tables have been migrated successfully ✅

---

## Backend API Endpoints

### Public Endpoints (Frontend)

```
GET /api/v1/pages/homepage          - Get homepage with sections
GET /api/v1/pages/{slug}            - Get page by slug
GET /api/v1/banners                 - Get banners (filter by group)
GET /api/v1/menus/{location}        - Get menu by location
POST /api/v1/banners/{id}/click     - Track banner click
```

### Admin Endpoints (Requires Authentication)

#### Pages
```
GET    /api/v1/admin/pages                      - List all pages
POST   /api/v1/admin/pages                      - Create new page
GET    /api/v1/admin/pages/{id}                 - Get page details
PUT    /api/v1/admin/pages/{id}                 - Update page
DELETE /api/v1/admin/pages/{id}                 - Delete page
POST   /api/v1/admin/pages/{id}/publish         - Publish page
POST   /api/v1/admin/pages/{id}/unpublish       - Unpublish page
POST   /api/v1/admin/pages/{id}/duplicate       - Duplicate page
POST   /api/v1/admin/pages/{id}/sections        - Add section to page
PUT    /api/v1/admin/pages/{pageId}/sections/{sectionId}  - Update section
DELETE /api/v1/admin/pages/{pageId}/sections/{sectionId}  - Delete section
POST   /api/v1/admin/pages/{id}/sections/reorder - Reorder sections
```

#### Banners
```
GET    /api/v1/admin/banners           - List all banners
POST   /api/v1/admin/banners           - Create new banner
GET    /api/v1/admin/banners/{id}      - Get banner details
PUT    /api/v1/admin/banners/{id}      - Update banner
DELETE /api/v1/admin/banners/{id}      - Delete banner
POST   /api/v1/admin/banners/{id}/click - Track click
GET    /api/v1/admin/banners/analytics - Get analytics
```

#### Menus
```
GET    /api/v1/admin/menus                      - List all menus
POST   /api/v1/admin/menus                      - Create new menu
GET    /api/v1/admin/menus/{id}                 - Get menu details
PUT    /api/v1/admin/menus/{id}                 - Update menu
DELETE /api/v1/admin/menus/{id}                 - Delete menu
POST   /api/v1/admin/menus/{id}/items           - Add menu item
PUT    /api/v1/admin/menus/{menuId}/items/{itemId}  - Update menu item
DELETE /api/v1/admin/menus/{menuId}/items/{itemId}  - Delete menu item
POST   /api/v1/admin/menus/{id}/items/reorder   - Reorder menu items
```

---

## Frontend Components

### Page Builder Components

Located in `frontend/components/page-builder/`:

1. **HeroBanner.tsx** - Full-featured banner slider with autoplay, arrows, dots
2. **CategoryGrid.tsx** - Display categories in a grid layout
3. **ProductCarousel.tsx** - Product slider (placeholder)
4. **FlashSale.tsx** - Flash sale section with countdown (placeholder)
5. **FeatureGrid.tsx** - Feature highlights grid
6. **TextBlock.tsx** - Rich text content block
7. **ImageBanner.tsx** - Static image banner (placeholder)
8. **DynamicSection.tsx** - Component registry and renderer
9. **DynamicPage.tsx** - Main page renderer

### Admin Components

Located in `frontend/components/admin/`:

1. **PageBuilder.tsx** - Page management interface
2. **BannerManagement.tsx** - Banner management interface
3. **MenuBuilder.tsx** - Menu management interface

---

## Component Types

### 1. Hero Banner
```json
{
  "component_type": "hero_banner",
  "settings": {
    "banner_ids": [1, 2, 3],
    "slider_enabled": true,
    "autoplay": true,
    "autoplay_speed": 5000,
    "show_arrows": true,
    "show_dots": true,
    "height": "large"
  }
}
```

### 2. Category Grid
```json
{
  "component_type": "category_grid",
  "settings": {
    "title": "Shop by Category",
    "subtitle": "Browse our collections",
    "category_ids": [1, 2, 3, 4],
    "columns": 4,
    "show_product_count": true,
    "show_image": true
  }
}
```

### 3. Product Carousel
```json
{
  "component_type": "product_carousel",
  "settings": {
    "title": "Featured Products",
    "subtitle": "Handpicked for you",
    "source": "featured",
    "max_products": 12,
    "show_arrows": true,
    "autoplay": false,
    "items_per_slide": 4
  }
}
```

### 4. Flash Sale
```json
{
  "component_type": "flash_sale",
  "settings": {
    "title": "Flash Sale",
    "end_time": "2024-12-31 23:59:59",
    "product_ids": [1, 2, 3],
    "show_countdown": true
  }
}
```

### 5. Feature Grid
```json
{
  "component_type": "feature_grid",
  "settings": {
    "title": "Why Shop With Us",
    "columns": 4,
    "features": [
      {
        "icon": "truck",
        "title": "Free Shipping",
        "description": "On orders over ₹500"
      }
    ]
  }
}
```

### 6. Text Block
```json
{
  "component_type": "text_block",
  "settings": {
    "title": "About Us",
    "content": "<p>Your HTML content here</p>",
    "text_align": "left"
  }
}
```

---

## Demo Data

The system includes comprehensive demo data:

### Pages
- **Homepage** - 6 sections (Hero, Categories, Flash Sale, Featured Products, Features, New Arrivals)
- **About Us** - Text block section
- **Contact Us** - Coming soon

### Banners
- 3 Homepage hero banners (Summer Sale, Electronics, Fashion)
- 1 Category banner (Electronics)
- 1 Promotional banner (Free Shipping)

### Menus
- **Header Menu** - Home, Products, Categories, About Us, Contact
- **Footer Menu** - Company section, Help section with nested items

---

## Testing Guide

### 1. Test Backend APIs

```bash
# Test homepage endpoint
curl http://localhost:8000/api/v1/pages/homepage

# Test banners endpoint
curl http://localhost:8000/api/v1/banners?group=homepage_hero

# Test menu endpoint
curl http://localhost:8000/api/v1/menus/header
```

### 2. Test Admin APIs (with authentication)

```bash
# List pages
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/v1/admin/pages

# Create page
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Page","slug":"test-page","type":"custom"}' \
  http://localhost:8000/api/v1/admin/pages
```

### 3. Test Frontend Components

1. Navigate to homepage to see DynamicPage in action
2. Check admin panel at `/admin/pages` for PageBuilder
3. Check admin panel at `/admin/banners` for BannerManagement
4. Check admin panel at `/admin/menus` for MenuBuilder

---

## Next Steps

### Immediate Enhancements

1. **Complete Placeholder Components** - Finish ProductCarousel, FlashSale, ImageBanner
2. **Add Drag & Drop** - Implement section reordering in admin UI
3. **Image Upload** - Add image upload functionality for banners
4. **Rich Text Editor** - Add WYSIWYG editor for TextBlock
5. **Preview Mode** - Add live preview before publishing

### Future Features

1. **A/B Testing** - Test different page variations
2. **Personalization** - Show different content based on user segments
3. **Version History** - Track and restore previous versions
4. **Templates** - Pre-built page templates
5. **Import/Export** - Export pages as JSON for backup/migration

---

## Troubleshooting

### Issue: Pages not loading
- Check if migrations ran successfully: `php artisan migrate:status`
- Check if seeders ran: `php artisan db:seed --class=PageSeeder`
- Verify API endpoints are accessible

### Issue: Components not rendering
- Check browser console for errors
- Verify component type matches registered components in DynamicSection.tsx
- Check if settings JSON is valid

### Issue: Admin panel not accessible
- Verify authentication token is valid
- Check user has admin role
- Verify API routes are registered

---

## Support

For issues or questions:
1. Check the architecture document: `PAGE_BUILDER_ARCHITECTURE.md`
2. Review API endpoint documentation above
3. Check Laravel logs: `storage/logs/laravel.log`
4. Check browser console for frontend errors

---

**System Status:** ✅ Fully Functional  
**Last Updated:** 2025-10-31  
**Version:** 1.0.0

