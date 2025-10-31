# Vendor Status Management Guide

## Overview
The vendor management system has multiple status fields that work together to control vendor access and operations. This guide explains how each field works and how to use them.

---

## 📊 **Status Fields Explained**

### 1. **`verification_status`** (Approval Workflow)
Controls whether a vendor is approved to operate on the platform.

**Values:**
- `pending` - Vendor has registered but not yet approved by admin
- `approved` - Vendor is approved and can operate
- `rejected` - Vendor application was rejected

**When to use:**
- Use "Pending Approval" tab to see new vendor applications
- Approve vendors after reviewing their KYC documents
- Reject vendors who don't meet requirements

**Important:** This is a ONE-TIME approval process. Once approved, this status doesn't change unless you manually reject them.

---

### 2. **`status`** (Operational Status)
Controls the current operational state of an approved vendor.

**Values:**
- `active` - Vendor is currently operating normally
- `inactive` - Vendor is temporarily not operating (e.g., on leave/holiday)
- `suspended` - Vendor is suspended by admin (penalty/violation)

**When to use:**
- **Active**: Default state for approved vendors
- **Inactive**: When vendor takes holiday/leave (can be set automatically via leave system)
- **Suspended**: When vendor violates policies or needs to be temporarily blocked

**Important:** This can change multiple times. A vendor can go from active → inactive → active → suspended → active, etc.

---

### 3. **`kyc_status`** (KYC Verification)
Tracks the KYC document verification process.

**Values:**
- `pending` - KYC documents not submitted
- `under_review` - KYC documents submitted, admin reviewing
- `verified` - KYC documents verified
- `rejected` - KYC documents rejected

**When to use:**
- Review KYC documents before approving vendors
- Verify GST, PAN, Aadhaar, business documents

---

## 🔄 **How Status Fields Work Together**

### Example Vendor Lifecycle:

1. **New Registration:**
   - `verification_status`: `pending`
   - `status`: `active` (default)
   - `kyc_status`: `pending`

2. **After Admin Approval:**
   - `verification_status`: `approved` ✅
   - `status`: `active` ✅
   - `kyc_status`: `verified` ✅
   - **Result:** Vendor can now sell products

3. **Vendor Takes Holiday (Dec 25-31):**
   - `verification_status`: `approved` (unchanged)
   - `status`: `inactive` 🏖️
   - `kyc_status`: `verified` (unchanged)
   - **Result:** Vendor's store shows "On Holiday" message

4. **Vendor Returns from Holiday (Jan 1):**
   - `verification_status`: `approved` (unchanged)
   - `status`: `active` ✅ (auto-reactivated)
   - `kyc_status`: `verified` (unchanged)
   - **Result:** Vendor can sell again

5. **Admin Suspends Vendor (Policy Violation):**
   - `verification_status`: `approved` (unchanged)
   - `status`: `suspended` ⛔
   - `kyc_status`: `verified` (unchanged)
   - `suspension_reason`: "Selling counterfeit products"
   - **Result:** Vendor cannot sell, customers see suspension notice

6. **Admin Unsuspends Vendor:**
   - `verification_status`: `approved` (unchanged)
   - `status`: `active` ✅
   - `kyc_status`: `verified` (unchanged)
   - `suspension_reason`: `null` (cleared)
   - **Result:** Vendor can sell again

---

## 🎯 **Admin Actions Guide**

### **Vendors Tab - Actions Available:**

#### **Pending Approval Tab:**
- **Approve** - Sets `verification_status` to `approved`
- **Reject** - Sets `verification_status` to `rejected` (requires reason)

#### **Active Tab:**
- **Deactivate** - Sets `status` to `inactive` (for manual leave)
- **Suspend** - Sets `status` to `suspended` + records reason, timestamp, admin ID

#### **Inactive Tab:**
- **Activate** - Sets `status` to `active`

#### **Suspended Tab:**
- **Unsuspend** - Sets `status` to `active` + clears suspension data

---

## 🏖️ **Vendor Leave/Holiday System**

### **How It Works:**

1. **Vendor Requests Leave:**
   - Vendor goes to their dashboard → "Request Leave"
   - Selects dates: From Date, To Date
   - Selects type: Holiday, Emergency, Medical, Other
   - Enters reason
   - Submits request

2. **Admin Reviews Leave:**
   - Admin sees leave request in "Pending Leaves" section
   - Can approve or reject with notes

3. **Leave Activated:**
   - On `from_date`, vendor's `status` automatically changes to `inactive`
   - Vendor's store shows "On Leave" message with return date
   - Products remain visible but cannot be ordered

4. **Leave Ends:**
   - On `to_date + 1 day`, vendor's `status` automatically changes back to `active`
   - If `auto_reactivate` is enabled (default: true)

### **Leave Types:**
- **Holiday** - Planned vacation/festival
- **Emergency** - Unexpected emergency
- **Medical** - Medical leave
- **Other** - Other reasons

### **Database Fields:**
```
vendor_leaves table:
- from_date: Start date of leave
- to_date: End date of leave
- reason: Why vendor is taking leave
- type: holiday/emergency/medical/other
- status: pending/approved/rejected/active/completed
- auto_reactivate: Whether to auto-activate vendor after leave ends
```

---

## 🔐 **Suspension System**

### **When to Suspend:**
- Policy violations
- Selling prohibited items
- Fake/counterfeit products
- Customer complaints
- Payment disputes
- Fraud detection

### **Suspension Process:**
1. Admin clicks "Suspend" button
2. Enters suspension reason (required)
3. System records:
   - `status` → `suspended`
   - `suspension_reason` → admin's reason
   - `suspended_at` → current timestamp
   - `suspended_by` → admin user ID

### **Unsuspension Process:**
1. Admin clicks "Unsuspend" button
2. System clears:
   - `status` → `active`
   - `suspension_reason` → `null`
   - `suspended_at` → `null`
   - `suspended_by` → `null`

---

## 📋 **Quick Reference**

### **Tab Filters:**

| Tab | Filter Condition |
|-----|-----------------|
| All Vendors | No filter |
| Pending Approval | `verification_status = 'pending'` |
| Active | `status = 'active'` |
| Inactive | `status = 'inactive'` |
| Suspended | `status = 'suspended'` |

### **Button Visibility:**

| Vendor Status | Available Actions |
|--------------|------------------|
| Pending (verification) | Approve, Reject |
| Active | Deactivate, Suspend |
| Inactive | Activate |
| Suspended | Unsuspend |

---

## 🚀 **Best Practices**

1. **Always provide reasons** when rejecting or suspending vendors
2. **Review KYC documents** before approving vendors
3. **Use inactive status** for temporary closures (holidays, maintenance)
4. **Use suspended status** for policy violations
5. **Enable auto-reactivate** for leave requests to avoid manual work
6. **Monitor suspension reasons** to identify common issues
7. **Set up automated leave approval** for trusted vendors

---

## 🔧 **API Endpoints**

```
GET  /api/v1/admin/vendors?status=pending     # Pending approval
GET  /api/v1/admin/vendors?status=active      # Active vendors
GET  /api/v1/admin/vendors?status=inactive    # Inactive vendors
GET  /api/v1/admin/vendors?status=suspended   # Suspended vendors

POST   /api/v1/admin/vendors/{id}/approve     # Approve vendor
POST   /api/v1/admin/vendors/{id}/reject      # Reject vendor
PATCH  /api/v1/admin/vendors/{id}/status      # Update status (active/inactive)
POST   /api/v1/admin/vendors/{id}/suspend     # Suspend vendor
```

---

## ❓ **FAQ**

**Q: What's the difference between "rejected" and "suspended"?**
A: Rejected = never approved (one-time decision). Suspended = was approved but temporarily blocked (can be reversed).

**Q: Can a vendor be "approved" but "inactive"?**
A: Yes! `verification_status=approved` + `status=inactive` means vendor is approved but currently on leave.

**Q: How do I permanently ban a vendor?**
A: Suspend them and don't unsuspend. Or set `verification_status=rejected`.

**Q: What happens to vendor's products when suspended?**
A: Products remain in database but are hidden from customers. Orders cannot be placed.

**Q: Can vendors self-deactivate?**
A: Yes, through the leave request system. They request leave, admin approves, system auto-deactivates.

---

## 📞 **Support**

For technical issues or questions, contact the development team.

