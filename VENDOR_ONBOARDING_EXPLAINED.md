# 🏪 VENDOR ONBOARDING SYSTEM - COMPLETE EXPLANATION

## 📋 **TABLE OF CONTENTS**
1. [Overview](#overview)
2. [Seller Registration vs Seller Onboarding](#difference)
3. [Complete Vendor Journey](#journey)
4. [5-Step Onboarding Process](#steps)
5. [Admin Approval Workflow](#approval)
6. [Database Structure](#database)
7. [Required Documents](#documents)
8. [Testing Guide](#testing)

---

## 🎯 **OVERVIEW** {#overview}

The vendor onboarding system is a **2-phase process** designed to ensure only legitimate, verified sellers can sell on the platform:

### **Phase 1: Seller Registration** (Quick - 2 minutes)
- Basic account creation
- Email and password setup
- User gets access to the platform

### **Phase 2: Seller Onboarding** (Detailed - 15-30 minutes)
- Complete business verification
- KYC (Know Your Customer) compliance
- Document submission
- Admin approval required

---

## 🔄 **SELLER REGISTRATION vs SELLER ONBOARDING** {#difference}

### **SELLER REGISTRATION** (Step 1)

**What it is:**
- Creating a basic user account with "vendor" role
- Similar to signing up for any website

**What happens:**
- User fills a simple form with:
  - ✅ Full Name
  - ✅ Email Address
  - ✅ Phone Number
  - ✅ Password
  - ✅ Confirm Password
- User agrees to Terms & Conditions
- Account is created in the database
- User is logged in automatically
- User is redirected to **Onboarding Page**

**What the user CAN do after registration:**
- ❌ Cannot add products yet
- ❌ Cannot receive orders yet
- ❌ Cannot access full vendor dashboard
- ✅ Can access onboarding wizard
- ✅ Can fill business details
- ✅ Can upload documents

**Database Entry:**
```sql
-- users table
INSERT INTO users (name, email, phone, password, role)
VALUES ('John Doe', 'john@example.com', '+91 9876543210', 'hashed_password', 'vendor');

-- vendors table (created automatically)
INSERT INTO vendors (user_id, status)
VALUES (1, 'pending');
```

**URL:** `http://localhost:3000/vendor/register`

---

### **SELLER ONBOARDING** (Step 2)

**What it is:**
- A comprehensive **5-step KYC verification process**
- Collects all business information
- Verifies seller legitimacy
- Ensures compliance with Indian regulations

**What happens:**
- User completes 5 detailed steps
- Each step saves data to database
- Progress is tracked (Step 1/5, Step 2/5, etc.)
- Documents are uploaded and stored
- Final submission goes to admin for approval

**What the user CAN do after onboarding:**
- ✅ Wait for admin approval
- ✅ View onboarding status
- ✅ Edit submitted information (if rejected)
- ❌ Cannot sell until approved

**Database Entries:**
```sql
-- vendor_onboarding_steps table
INSERT INTO vendor_onboarding_steps (
  vendor_id, current_step, step_1_completed, step_2_completed,
  step_3_completed, step_4_completed, step_5_completed,
  is_completed, verification_status
) VALUES (1, 5, true, true, true, true, true, true, 'in_review');

-- vendor_kyc_documents table
INSERT INTO vendor_kyc_documents (vendor_id, document_type, document_url)
VALUES (1, 'pan_card', '/uploads/pan_123.pdf');

-- vendor_bank_accounts table
INSERT INTO vendor_bank_accounts (vendor_id, account_holder_name, account_number, ifsc_code)
VALUES (1, 'John Doe', '1234567890', 'SBIN0001234');

-- vendor_stores table
INSERT INTO vendor_stores (vendor_id, store_name, store_description)
VALUES (1, 'John Electronics', 'Best electronics in town');
```

**URL:** `http://localhost:3000/vendor/onboarding`

---

## 🚀 **COMPLETE VENDOR JOURNEY** {#journey}

### **Timeline: Registration to First Sale**

```
Day 1: Registration (2 minutes)
  ↓
  User visits: /vendor/register
  User fills: Name, Email, Phone, Password
  User clicks: "Create Seller Account"
  ↓
  Account created ✅
  User logged in ✅
  Redirected to: /vendor/onboarding
  ↓

Day 1: Onboarding - Step 1 (5 minutes)
  ↓
  Business Information Form
  - Business Name: "John Electronics"
  - Business Type: "Private Limited"
  - Business Category: "Electronics"
  - Business Address: Full address
  - Contact Person: Name, Email, Phone
  ↓
  Click "Next" → Step 2
  ↓

Day 1: Onboarding - Step 2 (3 minutes)
  ↓
  PAN & GST Details
  - PAN Number: "ABCDE1234F"
  - PAN Holder Name: "John Doe"
  - GST Registered: Yes/No
  - GSTIN: "29ABCDE1234F1Z5" (if registered)
  ↓
  Click "Next" → Step 3
  ↓

Day 1: Onboarding - Step 3 (5 minutes)
  ↓
  Bank Account Details
  - Account Holder Name: "John Doe"
  - Account Number: "1234567890"
  - IFSC Code: "SBIN0001234"
  - Bank Name: "State Bank of India"
  - Branch Name: "MG Road"
  - Account Type: "Current"
  ↓
  Click "Next" → Step 4
  ↓

Day 1: Onboarding - Step 4 (5 minutes)
  ↓
  Store Setup
  - Store Name: "John Electronics"
  - Store Description: "Best electronics..."
  - Store Logo: Upload image
  - Store Banner: Upload image
  - Return Policy: Text
  - Shipping Policy: Text
  - Customer Support Email: "support@john.com"
  - Customer Support Phone: "+91 9876543210"
  ↓
  Click "Next" → Step 5
  ↓

Day 1: Onboarding - Step 5 (10 minutes)
  ↓
  Document Upload
  - PAN Card: Upload PDF/Image
  - GST Certificate: Upload PDF/Image (if applicable)
  - Cancelled Cheque: Upload PDF/Image
  - Address Proof: Upload PDF/Image
  - Identity Proof: Upload PDF/Image
  ↓
  Click "Submit for Approval"
  ↓
  Status: "In Review" 🟡
  ↓

Day 2-3: Admin Review
  ↓
  Admin logs in: /admin/login
  Admin visits: /admin/vendors/pending
  Admin sees: John Electronics (pending)
  Admin reviews:
  - ✅ Business details
  - ✅ PAN & GST documents
  - ✅ Bank account info
  - ✅ Store setup
  - ✅ All uploaded documents
  ↓
  Admin clicks: "Approve" ✅
  OR
  Admin clicks: "Reject" ❌ (with reason)
  ↓

Day 3: Approved! 🎉
  ↓
  Status: "Approved" 🟢
  Vendor receives notification
  Vendor can now:
  - ✅ Access full vendor dashboard
  - ✅ Add products
  - ✅ Manage inventory
  - ✅ Receive orders
  - ✅ Process payments
  - ✅ Start selling!
```

---

## 📝 **5-STEP ONBOARDING PROCESS** {#steps}

### **STEP 1: Business Information** 📋

**Purpose:** Collect basic business details

**Fields Required:**
```javascript
{
  business_name: "John Electronics",           // Required
  business_type: "private_limited",            // Required (individual, partnership, private_limited, llp, public_limited)
  business_category: "Electronics",            // Required
  business_address: "123 MG Road",             // Required
  business_city: "Bangalore",                  // Required
  business_state: "Karnataka",                 // Required
  business_pincode: "560001",                  // Required
  business_phone: "+91 9876543210",            // Required
  contact_person_name: "John Doe",             // Required
  contact_person_email: "john@example.com",    // Required
  contact_person_phone: "+91 9876543210"       // Required
}
```

**Validation:**
- All fields are required
- Phone numbers must be valid Indian format
- Email must be valid format
- Pincode must be 6 digits

**Database Table:** `vendors` (updates existing record)

**API Endpoint:** `POST /api/v1/vendor/onboarding/business-info`

**Progress:** Step 1/5 completed (20%)

---

### **STEP 2: PAN & GST Details** 🆔

**Purpose:** Verify tax compliance and business identity

**Fields Required:**
```javascript
{
  pan_number: "ABCDE1234F",                    // Required (10 characters)
  pan_holder_name: "John Doe",                 // Required
  is_gst_registered: true,                     // Required (boolean)
  gstin: "29ABCDE1234F1Z5"                     // Required if GST registered (15 characters)
}
```

**Validation:**
- PAN format: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)
- GSTIN format: 2 digits + 10 char PAN + 1 digit + 1 letter + 1 digit (e.g., 29ABCDE1234F1Z5)
- PAN holder name must match business owner
- GSTIN is mandatory if annual turnover > ₹40 lakhs

**Database Table:** `vendors` (updates existing record)

**API Endpoint:** `POST /api/v1/vendor/onboarding/kyc-details`

**Progress:** Step 2/5 completed (40%)

---

### **STEP 3: Bank Account Details** 🏦

**Purpose:** Setup payment receiving account for vendor payouts

**Fields Required:**
```javascript
{
  account_holder_name: "John Doe",             // Required
  account_number: "1234567890",                // Required (9-18 digits)
  ifsc_code: "SBIN0001234",                    // Required (11 characters)
  bank_name: "State Bank of India",            // Required
  branch_name: "MG Road",                      // Required
  account_type: "current"                      // Required (savings/current)
}
```

**Validation:**
- Account number: 9-18 digits
- IFSC code: 11 characters (4 letters + 0 + 6 alphanumeric)
- Account holder name should match PAN holder
- Current account recommended for business

**Database Table:** `vendor_bank_accounts`

**API Endpoint:** `POST /api/v1/vendor/onboarding/bank-details`

**Progress:** Step 3/5 completed (60%)

**Security:**
- Account number is encrypted in database
- Only last 4 digits shown in UI
- Masked as: ******7890

---

### **STEP 4: Store Setup** 🏪

**Purpose:** Configure vendor's online store appearance and policies

**Fields Required:**
```javascript
{
  store_name: "John Electronics",              // Required
  store_description: "Best electronics...",    // Required (min 50 chars)
  store_logo: File,                            // Optional (image file)
  store_banner: File,                          // Optional (image file)
  return_policy: "30 days return...",          // Required (min 100 chars)
  shipping_policy: "Ships within 24 hours...", // Required (min 100 chars)
  customer_support_email: "support@john.com",  // Required
  customer_support_phone: "+91 9876543210"     // Required
}
```

**Validation:**
- Store name: 3-100 characters
- Description: minimum 50 characters
- Logo: max 2MB, formats: jpg, png, webp
- Banner: max 5MB, formats: jpg, png, webp
- Return policy: minimum 100 characters
- Shipping policy: minimum 100 characters

**Database Table:** `vendor_stores`

**API Endpoint:** `POST /api/v1/vendor/onboarding/store-details`

**Progress:** Step 4/5 completed (80%)

---

### **STEP 5: Document Upload** 📄

**Purpose:** Submit KYC documents for verification

**Documents Required:**

1. **PAN Card** (Mandatory)
   - Format: PDF, JPG, PNG
   - Max size: 2MB
   - Must be clear and readable
   - Name on PAN must match business owner

2. **GST Certificate** (If GST registered)
   - Format: PDF, JPG, PNG
   - Max size: 2MB
   - GSTIN must match Step 2

3. **Cancelled Cheque** (Mandatory)
   - Format: PDF, JPG, PNG
   - Max size: 2MB
   - Must show account number and IFSC
   - Account details must match Step 3

4. **Address Proof** (Mandatory)
   - Format: PDF, JPG, PNG
   - Max size: 2MB
   - Options: Electricity bill, Rent agreement, Property tax receipt
   - Must be recent (within 3 months)
   - Address must match Step 1

5. **Identity Proof** (Mandatory)
   - Format: PDF, JPG, PNG
   - Max size: 2MB
   - Options: Aadhaar, Passport, Driving License, Voter ID
   - Name must match PAN holder

**Upload Process:**
```javascript
{
  documents: [
    {
      document_type: "pan_card",
      file: File,
      document_number: "ABCDE1234F"
    },
    {
      document_type: "gst_certificate",
      file: File,
      document_number: "29ABCDE1234F1Z5"
    },
    {
      document_type: "cancelled_cheque",
      file: File
    },
    {
      document_type: "address_proof",
      file: File
    },
    {
      document_type: "identity_proof",
      file: File
    }
  ]
}
```

**Database Table:** `vendor_kyc_documents`

**API Endpoint:** `POST /api/v1/vendor/onboarding/documents`

**Progress:** Step 5/5 completed (100%)

**After Submission:**
- Status changes to: "In Review"
- Vendor receives confirmation email
- Admin is notified of new pending vendor
- Vendor waits for admin approval

---

## ✅ **ADMIN APPROVAL WORKFLOW** {#approval}

### **Admin Dashboard View**

**URL:** `http://localhost:3000/admin/vendors/pending`

**What Admin Sees:**

```
┌─────────────────────────────────────────────────────────────┐
│  Pending Vendor Approvals                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📋 John Electronics                                         │
│  📧 john@example.com  📱 +91 9876543210                     │
│  Status: in_review  Progress: 100% Complete                 │
│                                                              │
│  Business Type: Private Limited                             │
│  Category: Electronics                                       │
│  Location: Bangalore, Karnataka                             │
│  Submitted: Oct 29, 2025                                    │
│                                                              │
│  KYC Documents:                                             │
│  📄 PAN Card - pending                                      │
│  📄 GST Certificate - pending                               │
│  📄 Cancelled Cheque - pending                              │
│  📄 Address Proof - pending                                 │
│  📄 Identity Proof - pending                                │
│                                                              │
│  Bank Account:                                              │
│  Account Holder: John Doe                                   │
│  Bank: State Bank of India                                  │
│  IFSC: SBIN0001234                                          │
│                                                              │
│  Store Details:                                             │
│  Store Name: John Electronics                               │
│  Description: Best electronics in town...                   │
│  Support: support@john.com, +91 9876543210                 │
│                                                              │
│  [❌ Reject]  [✅ Approve]                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### **Admin Actions:**

**1. Approve Vendor:**
- Admin clicks "✅ Approve" button
- Confirmation dialog appears
- Admin confirms approval
- System updates:
  ```sql
  UPDATE vendor_onboarding_steps
  SET verification_status = 'approved',
      verified_at = NOW()
  WHERE vendor_id = 1;
  
  UPDATE vendors
  SET status = 'active'
  WHERE id = 1;
  ```
- Vendor receives approval email
- Vendor can now access full dashboard
- Vendor can start adding products

**2. Reject Vendor:**
- Admin clicks "❌ Reject" button
- Modal opens asking for rejection reason
- Admin enters reason: "PAN card image is not clear. Please upload a clearer copy."
- Admin confirms rejection
- System updates:
  ```sql
  UPDATE vendor_onboarding_steps
  SET verification_status = 'rejected',
      rejection_reason = 'PAN card image is not clear...'
  WHERE vendor_id = 1;
  
  UPDATE vendors
  SET status = 'rejected'
  WHERE id = 1;
  ```
- Vendor receives rejection email with reason
- Vendor can re-submit documents
- Vendor can edit onboarding information

---

## 🗄️ **DATABASE STRUCTURE** {#database}

### **Tables Involved:**

**1. users** (Basic account)
```sql
id, name, email, phone, password, role, created_at
```

**2. vendors** (Vendor profile)
```sql
id, user_id, business_name, business_type, business_category,
business_address, business_city, business_state, business_pincode,
business_phone, pan_number, pan_holder_name, gstin,
contact_person_name, contact_person_email, contact_person_phone,
status, created_at
```

**3. vendor_onboarding_steps** (Progress tracking)
```sql
id, vendor_id, current_step, step_1_completed, step_2_completed,
step_3_completed, step_4_completed, step_5_completed, is_completed,
verification_status, rejection_reason, submitted_at, verified_at
```

**4. vendor_kyc_documents** (Document storage)
```sql
id, vendor_id, document_type, document_number, document_url,
verification_status, rejection_reason, verified_at, created_at
```

**5. vendor_bank_accounts** (Payment details)
```sql
id, vendor_id, account_holder_name, account_number, ifsc_code,
bank_name, branch_name, account_type, is_verified, is_primary, created_at
```

**6. vendor_stores** (Store configuration)
```sql
id, vendor_id, store_name, store_description, store_logo, store_banner,
return_policy, shipping_policy, customer_support_email,
customer_support_phone, created_at
```

---

## 📄 **REQUIRED DOCUMENTS CHECKLIST** {#documents}

### **For All Vendors:**
- ✅ PAN Card (Mandatory)
- ✅ Cancelled Cheque (Mandatory)
- ✅ Address Proof (Mandatory)
- ✅ Identity Proof (Mandatory)

### **For GST Registered Vendors:**
- ✅ GST Certificate (Mandatory if turnover > ₹40 lakhs)

### **Document Specifications:**

| Document | Format | Max Size | Requirements |
|----------|--------|----------|--------------|
| PAN Card | PDF, JPG, PNG | 2MB | Clear, readable, name matches |
| GST Certificate | PDF, JPG, PNG | 2MB | GSTIN visible, valid |
| Cancelled Cheque | PDF, JPG, PNG | 2MB | Account number, IFSC visible |
| Address Proof | PDF, JPG, PNG | 2MB | Recent (within 3 months) |
| Identity Proof | PDF, JPG, PNG | 2MB | Government issued, valid |

---

## 🧪 **TESTING GUIDE** {#testing}

### **Test Scenario 1: Complete Vendor Onboarding**

1. **Register as Vendor:**
   ```
   Visit: http://localhost:3000/vendor/register
   Fill: Name, Email, Phone, Password
   Submit
   ```

2. **Complete Step 1:**
   ```
   Business Name: "Test Electronics"
   Business Type: "Private Limited"
   Category: "Electronics"
   Address: "123 Test Street, Bangalore, Karnataka, 560001"
   Contact: Your details
   Click: Next
   ```

3. **Complete Step 2:**
   ```
   PAN: "ABCDE1234F"
   PAN Holder: "Test User"
   GST Registered: Yes
   GSTIN: "29ABCDE1234F1Z5"
   Click: Next
   ```

4. **Complete Step 3:**
   ```
   Account Holder: "Test User"
   Account Number: "1234567890"
   IFSC: "SBIN0001234"
   Bank: "State Bank of India"
   Branch: "Test Branch"
   Account Type: "Current"
   Click: Next
   ```

5. **Complete Step 4:**
   ```
   Store Name: "Test Electronics Store"
   Description: "We sell the best electronics in town..."
   Return Policy: "30 days return policy..."
   Shipping Policy: "Ships within 24 hours..."
   Support Email: "support@test.com"
   Support Phone: "+91 9876543210"
   Click: Next
   ```

6. **Complete Step 5:**
   ```
   Upload: PAN Card (sample PDF)
   Upload: GST Certificate (sample PDF)
   Upload: Cancelled Cheque (sample PDF)
   Upload: Address Proof (sample PDF)
   Upload: Identity Proof (sample PDF)
   Click: Submit for Approval
   ```

7. **Verify Status:**
   ```
   Status should show: "In Review"
   Progress: 100%
   ```

### **Test Scenario 2: Admin Approval**

1. **Login as Admin:**
   ```
   Visit: http://localhost:3000/admin/login
   Email: admin@example.com
   Password: admin password
   ```

2. **View Pending Vendors:**
   ```
   Visit: http://localhost:3000/admin/vendors/pending
   Should see: "Test Electronics" in pending list
   ```

3. **Review Details:**
   ```
   Click on vendor card
   Review all information
   Check all documents
   ```

4. **Approve Vendor:**
   ```
   Click: "✅ Approve"
   Confirm approval
   Vendor status changes to: "Approved"
   ```

### **Test Scenario 3: Vendor Rejection**

1. **Reject Vendor:**
   ```
   Click: "❌ Reject"
   Enter reason: "PAN card image is not clear"
   Confirm rejection
   ```

2. **Verify Rejection:**
   ```
   Vendor status: "Rejected"
   Rejection reason visible to vendor
   Vendor can re-submit
   ```

---

## 🎯 **SUMMARY**

### **Key Differences:**

| Aspect | Seller Registration | Seller Onboarding |
|--------|-------------------|-------------------|
| **Time** | 2 minutes | 15-30 minutes |
| **Purpose** | Create account | Verify business |
| **Steps** | 1 step | 5 steps |
| **Documents** | None | 5 documents |
| **Approval** | Automatic | Admin required |
| **Can Sell?** | No | Yes (after approval) |
| **URL** | `/vendor/register` | `/vendor/onboarding` |

### **Complete Flow:**
```
Registration → Onboarding → Admin Approval → Start Selling
(2 min)      → (30 min)   → (1-2 days)     → (Active)
```

---

**The vendor onboarding system ensures only verified, legitimate sellers can sell on the platform!** 🎉

