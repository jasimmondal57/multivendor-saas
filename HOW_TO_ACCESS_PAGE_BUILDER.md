# How to Access Page Builder in Admin Panel

## 🎯 Quick Answer

The Page Builder menus are now available in your **Admin Panel Sidebar**!

---

## 📍 Where to Find It

### **Step 1: Login to Admin Panel**
```
URL: http://localhost:3000/admin/login
```

**Test Credentials:**
- Email: `admin@example.com`
- Password: `password`

### **Step 2: Navigate to Admin Dashboard**
After login, you'll be redirected to:
```
URL: http://localhost:3000/admin/dashboard
```

### **Step 3: Look at the Sidebar Menu**

You'll see **3 new menu items** in the sidebar (after "Vendor Payouts"):

```
┌─────────────────────────────────┐
│  Admin Panel                    │
├─────────────────────────────────┤
│  📊 Dashboard                   │
│  🏢 Vendors                     │
│  📅 Leave Applications          │
│  📦 Products                    │
│  🛒 Orders                      │
│  👥 Customers                   │
│  ⭐ Reviews                     │
│  🎟️  Coupons                    │
│  💳 Payments                    │
│  💰 Revenue Management          │
│  📋 TDS Management              │
│  💸 Vendor Payouts              │
│                                 │
│  📄 Page Builder        ← NEW!  │
│  🖼️  Banner Management   ← NEW!  │
│  📑 Menu Builder        ← NEW!  │
│                                 │
│  📊 Reports                     │
│  📈 Analytics                   │
│  ⚙️  Settings                   │
└─────────────────────────────────┘
```

---

## 🎨 The 3 New Menu Items

### 1. **📄 Page Builder**
**What it does:** Manage dynamic landing pages

**Features:**
- Create new pages (Homepage, Landing Pages, Custom Pages)
- Add sections to pages (Hero Banner, Categories, Products, etc.)
- Publish/Unpublish pages
- Duplicate pages
- SEO settings (meta title, description)

**Click on:** "Page Builder" in sidebar

---

### 2. **🖼️ Banner Management**
**What it does:** Manage promotional banners and sliders

**Features:**
- Create banners for different groups (Homepage Hero, Category Pages, etc.)
- Schedule banners (start date, end date)
- Add CTA buttons (Call-to-Action)
- Track banner clicks and views
- Multi-device images (Desktop, Mobile, Tablet)

**Click on:** "Banner Management" in sidebar

---

### 3. **📑 Menu Builder**
**What it does:** Build navigation menus

**Features:**
- Create menus for different locations (Header, Footer, Sidebar)
- Add menu items with icons
- Nested menu items (parent-child structure)
- Reorder menu items
- Control visibility (mobile/desktop)

**Click on:** "Menu Builder" in sidebar

---

## 🚀 Quick Start Guide

### **Create Your First Page**

1. Click **"Page Builder"** in sidebar
2. Click **"Create New Page"** button
3. Fill in:
   - Page Name: "My Landing Page"
   - Slug: "my-landing-page" (or leave blank for auto-generate)
   - Type: "Landing Page"
   - Meta Title: "My Awesome Landing Page"
4. Click **"Create Page"**
5. Click **"Edit"** to add sections
6. Click **"Publish"** when ready

### **Create Your First Banner**

1. Click **"Banner Management"** in sidebar
2. Click **"Create New Banner"** button
3. Fill in:
   - Title: "Summer Sale 2024"
   - Subtitle: "Up to 50% OFF"
   - Banner Group: "Homepage Hero"
   - CTA Text: "Shop Now"
   - CTA Link: "/products"
4. Click **"Create Banner"**

### **Create Your First Menu**

1. Click **"Menu Builder"** in sidebar
2. Click **"Create New Menu"** button
3. Fill in:
   - Menu Name: "Main Navigation"
   - Location: "Header"
4. Click **"Create Menu"**
5. Click **"Edit Items"** to add menu items

---

## 📊 Demo Data Already Available

The system comes with demo data already seeded:

### **Pages (3 pages)**
- ✅ Homepage - with 6 sections
- ✅ About Us - with text content
- ✅ Contact Us - coming soon

### **Banners (5 banners)**
- ✅ Summer Sale 2024
- ✅ New Electronics Collection
- ✅ Fashion Week Special
- ✅ Electronics Mega Sale
- ✅ Free Shipping Promo

### **Menus (2 menus)**
- ✅ Main Navigation (Header) - 5 items
- ✅ Footer Navigation - with nested items

**You can view, edit, or delete these demo items!**

---

## 🔍 Visual Location in Sidebar

The new menus appear **between "Vendor Payouts" and "Reports"**:

```
...
💸 Vendor Payouts
─────────────────
📄 Page Builder        ← Click here for pages
🖼️  Banner Management   ← Click here for banners
📑 Menu Builder        ← Click here for menus
─────────────────
📊 Reports
...
```

---

## 🎯 What Each Menu Shows

### **Page Builder Screen**
```
┌──────────────────────────────────────────────┐
│  Page Builder              [Create New Page] │
├──────────────────────────────────────────────┤
│  Name       │ Slug      │ Type   │ Status   │
│  Homepage   │ home      │ home   │ Published│
│  About Us   │ about-us  │ custom │ Published│
│  Contact    │ contact   │ custom │ Draft    │
└──────────────────────────────────────────────┘
```

### **Banner Management Screen**
```
┌──────────────────────────────────────────────┐
│  Banner Management      [Create New Banner]  │
├──────────────────────────────────────────────┤
│  Title              │ Group         │ Status │
│  Summer Sale 2024   │ homepage_hero │ Active │
│  Electronics Sale   │ category      │ Active │
│  Free Shipping      │ promotional   │ Active │
└──────────────────────────────────────────────┘
```

### **Menu Builder Screen**
```
┌──────────────────────────────────────────────┐
│  Menu Builder              [Create New Menu] │
├──────────────────────────────────────────────┤
│  Name             │ Location │ Items │ Status│
│  Main Navigation  │ header   │ 5     │ Active│
│  Footer Nav       │ footer   │ 8     │ Active│
└──────────────────────────────────────────────┘
```

---

## 🔧 Troubleshooting

### **Can't see the new menus?**

1. **Clear browser cache** and refresh
2. **Logout and login again**
3. Make sure you're logged in as **admin** (not vendor or customer)
4. Check browser console for errors (F12)

### **Menus appear but show errors?**

1. Make sure **backend server is running**:
   ```bash
   cd backend && php artisan serve
   ```

2. Make sure **frontend server is running**:
   ```bash
   cd frontend && npm run dev
   ```

3. Check if **migrations ran**:
   ```bash
   cd backend && php artisan migrate:status
   ```

4. Check if **seeders ran**:
   ```bash
   cd backend && php artisan db:seed --class=PageSeeder
   ```

---

## 📱 Mobile View

On mobile devices, the sidebar collapses. Click the **hamburger menu** (☰) to open it and access the Page Builder menus.

---

## 🎉 You're All Set!

The Page Builder is now fully integrated into your admin panel. Start creating amazing landing pages! 🚀

---

## 📚 Additional Resources

- **Architecture:** `PAGE_BUILDER_ARCHITECTURE.md`
- **User Guide:** `PAGE_BUILDER_GUIDE.md`
- **Implementation Summary:** `PAGE_BUILDER_IMPLEMENTATION_SUMMARY.md`

---

**Need Help?** Check the documentation files or ask for assistance! 😊

