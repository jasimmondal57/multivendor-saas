import api from './api';

export interface AdminStats {
  total_vendors: number;
  total_customers: number;
  total_orders: number;
  total_revenue: number;
  pending_vendors: number;
  pending_products: number;
  total_products: number;
  total_reviews: number;
  active_coupons: number;
}

export interface Vendor {
  id: number;
  user_id: number;
  business_name: string;
  business_type?: string;
  business_phone?: string;
  business_email?: string;
  business_address?: string;
  business_city?: string;
  business_state?: string;
  business_pincode?: string;
  website?: string;
  gstin?: string;
  pan?: string;
  aadhaar?: string;
  status: string;
  verification_status?: string;
  kyc_status?: string;
  suspension_reason?: string;
  suspended_at?: string;
  total_sales?: number;
  total_orders?: number;
  average_rating?: number;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  store?: {
    store_name: string;
    store_description: string;
  };
}

export interface Product {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  short_description?: string;
  mrp?: number;
  selling_price: number;
  cost_price?: number;
  discount_percentage?: number;
  stock_quantity: number;
  low_stock_threshold?: number;
  stock_status?: 'in_stock' | 'out_of_stock' | 'low_stock';
  original_stock_status?: string;
  unavailability_reason?: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  is_returnable?: boolean;
  return_period_days?: number;
  hsn_code?: string;
  gst_percentage?: number;
  status?: 'active' | 'inactive' | 'banned';
  ban_reason?: string;
  banned_at?: string;
  banned_by?: number;
  approval_status: string;
  rejection_reason?: string;
  is_featured?: boolean;
  is_active?: boolean;
  is_trending?: boolean;
  view_count?: number;
  order_count?: number;
  rating?: number;
  review_count?: number;
  created_at: string;
  updated_at?: string;
  category: {
    id: number;
    name: string;
    slug?: string;
  };
  vendor: {
    id: number;
    user: {
      id: number;
      name: string;
      email?: string;
    };
    business_name?: string;
  };
}

export interface Order {
  id: number;
  uuid?: string;
  order_number: string;
  invoice_number?: string;
  invoice_generated_at?: string;
  status: string;
  payment_status?: string;
  total_amount: number;
  subtotal?: number;
  tax_amount?: number;
  shipping_amount?: number;
  discount_amount?: number;
  payment_method: string;
  payment_transaction_id?: string;
  shipping_address?: string;
  billing_address?: string;
  tracking_number?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  customer: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  items?: Array<{
    id: number;
    product_id?: number;
    product_name: string;
    product_sku?: string;
    quantity: number;
    price: number;
    total_price: number;
    total_amount?: number;
    vendor_id?: number;
    vendor?: {
      id: number;
      business_name: string;
      business_email?: string;
      business_phone?: string;
      business_address?: string;
      business_city?: string;
      business_state?: string;
      business_pincode?: string;
      gstin?: string;
      store?: {
        store_name: string;
        customer_support_email?: string;
        customer_support_phone?: string;
      };
    };
  }>;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  email_verified_at?: string;
  last_login_at?: string;
  created_at: string;
}

export interface Review {
  id: number;
  rating: number;
  review: string;
  created_at: string;
  user: {
    name: string;
  };
  product: {
    name: string;
  };
}

export interface Coupon {
  id: number;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_value: number;
  max_discount: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  usage_count: number;
  usage_limit: number;
}

export interface Category {
  id: number;
  uuid?: string;
  parent_id?: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order?: number;
  products_count?: number;
  created_at: string;
  parent?: {
    id: number;
    name: string;
  };
  children?: Category[];
}

export interface Payment {
  id: number;
  order_id: number;
  transaction_id: string;
  payment_method: string;
  amount: number;
  status: string;
  payment_date: string;
  created_at: string;
  order?: {
    id: number;
    order_number: string;
    customer?: {
      name: string;
      email: string;
    };
  };
}

export const adminService = {
  // Dashboard Stats
  async getStats(): Promise<{ success: boolean; data: AdminStats }> {
    const response = await api.get('/v1/admin/dashboard/stats');
    return response.data;
  },

  // Vendors
  async getVendors(params?: {
    page?: number;
    status?: string;
    search?: string;
  }): Promise<{ success: boolean; data: { data: Vendor[]; total: number } }> {
    const response = await api.get('/v1/admin/vendors', { params });
    return response.data;
  },

  async getPendingVendors(): Promise<{ success: boolean; data: any }> {
    const response = await api.get('/v1/admin/vendors/pending');
    return response.data;
  },

  async approveVendor(vendorId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/v1/admin/vendors/${vendorId}/approve`);
    return response.data;
  },

  async rejectVendor(vendorId: number, reason?: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/v1/admin/vendors/${vendorId}/reject`, { reason });
    return response.data;
  },

  async updateVendorStatus(vendorId: number, status: string): Promise<{ success: boolean; message: string }> {
    const response = await api.patch(`/v1/admin/vendors/${vendorId}/status`, { status });
    return response.data;
  },

  async suspendVendor(vendorId: number, reason: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/v1/admin/vendors/${vendorId}/suspend`, { reason });
    return response.data;
  },

  // Products
  async getProducts(params?: {
    page?: number;
    approval_status?: string;
    search?: string;
  }): Promise<{ success: boolean; data: { data: Product[]; total: number } }> {
    const response = await api.get('/v1/admin/products', { params });
    return response.data;
  },

  async approveProduct(productId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/v1/admin/products/${productId}/approve`);
    return response.data;
  },

  async rejectProduct(productId: number, reason?: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/v1/admin/products/${productId}/reject`, { reason });
    return response.data;
  },

  async banProduct(productId: number, reason: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/v1/admin/products/${productId}/ban`, { reason });
    return response.data;
  },

  async unbanProduct(productId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/v1/admin/products/${productId}/unban`);
    return response.data;
  },

  // Orders
  async getOrders(params?: {
    page?: number;
    status?: string;
    search?: string;
  }): Promise<{ success: boolean; data: { data: Order[]; total: number } }> {
    const response = await api.get('/v1/admin/orders', { params });
    return response.data;
  },

  async updateOrderStatus(orderId: number, status: string): Promise<{ success: boolean; message: string }> {
    const response = await api.patch(`/v1/admin/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Customers
  async getCustomers(params?: {
    page?: number;
    search?: string;
  }): Promise<{ success: boolean; data: { data: Customer[]; total: number } }> {
    const response = await api.get('/v1/admin/customers', { params });
    return response.data;
  },

  async updateUserStatus(userId: number, action: string): Promise<{ success: boolean; message: string }> {
    const response = await api.patch(`/v1/admin/users/${userId}/status`, { action });
    return response.data;
  },

  // Reviews
  async getReviews(params?: {
    page?: number;
    rating?: number;
    search?: string;
  }): Promise<{ success: boolean; data: { data: Review[]; total: number } }> {
    const response = await api.get('/v1/admin/reviews', { params });
    return response.data;
  },

  // Coupons
  async getCoupons(params?: {
    page?: number;
    status?: string;
  }): Promise<{ success: boolean; data: { data: Coupon[]; total: number } }> {
    const response = await api.get('/v1/admin/coupons', { params });
    return response.data;
  },

  async createCoupon(data: any): Promise<{ success: boolean; data: Coupon }> {
    const response = await api.post('/v1/admin/coupons', data);
    return response.data;
  },

  // Categories
  async getCategories(params?: {
    page?: number;
    search?: string;
    is_active?: boolean;
  }): Promise<{ success: boolean; data: { data: Category[]; total: number } }> {
    const response = await api.get('/v1/admin/categories', { params });
    return response.data;
  },

  async createCategory(data: any): Promise<{ success: boolean; data: Category }> {
    const response = await api.post('/v1/admin/categories', data);
    return response.data;
  },

  async updateCategory(categoryId: number, data: any): Promise<{ success: boolean; data: Category }> {
    const response = await api.put(`/v1/admin/categories/${categoryId}`, data);
    return response.data;
  },

  async deleteCategory(categoryId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/v1/admin/categories/${categoryId}`);
    return response.data;
  },

  async toggleCategoryStatus(categoryId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.patch(`/v1/admin/categories/${categoryId}/toggle-status`);
    return response.data;
  },

  // Payments
  async getPayments(params?: {
    page?: number;
    status?: string;
    payment_method?: string;
  }): Promise<{ success: boolean; data: { data: Payment[]; total: number } }> {
    const response = await api.get('/v1/admin/payments', { params });
    return response.data;
  },

  // Analytics
  async getAnalytics(period: number = 30): Promise<{ success: boolean; data: any }> {
    const response = await api.get('/v1/admin/analytics', { params: { period } });
    return response.data;
  },

  // Reports
  async getReports(params?: {
    type?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<{ success: boolean; data: any }> {
    const response = await api.get('/v1/admin/reports', { params });
    return response.data;
  },

  // Settings
  async getSettings(group?: string): Promise<{ success: boolean; data: any }> {
    const response = await api.get('/v1/admin/settings', { params: { group: group || 'all' } });
    return response.data;
  },

  async updateSettings(group: string, settings: any): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/v1/admin/settings', { group, settings });
    return response.data;
  },

  // Email Templates
  async getEmailTemplates(category?: string): Promise<{ success: boolean; data: any[] }> {
    const response = await api.get('/v1/admin/email-templates', { params: { category: category || 'all' } });
    return response.data;
  },

  async getEmailTemplate(id: number): Promise<{ success: boolean; data: any }> {
    const response = await api.get(`/v1/admin/email-templates/${id}`);
    return response.data;
  },

  async updateEmailTemplate(id: number, data: any): Promise<{ success: boolean; message: string; data: any }> {
    const response = await api.put(`/v1/admin/email-templates/${id}`, data);
    return response.data;
  },

  async resetEmailTemplate(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/v1/admin/email-templates/${id}/reset`);
    return response.data;
  },

  async testEmailTemplate(id: number, testEmail: string, testData?: any): Promise<{ success: boolean; message: string; preview: any }> {
    const response = await api.post(`/v1/admin/email-templates/${id}/test`, { test_email: testEmail, test_data: testData });
    return response.data;
  },
};

// WhatsApp Template Management
export interface WhatsAppTemplate {
  id: number;
  code: string;
  name: string;
  category: 'otp' | 'customer' | 'vendor' | 'admin';
  language: string;
  header?: string;
  body: string;
  footer?: string;
  button_type?: 'QUICK_REPLY' | 'CALL_TO_ACTION' | 'NONE';
  buttons?: any[];
  variables?: string[];
  meta_template_id?: string;
  meta_template_name?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected';
  rejection_reason?: string;
  submitted_at?: string;
  approved_at?: string;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const whatsappTemplateService = {
  async getTemplates(category?: string): Promise<{ success: boolean; data: WhatsAppTemplate[] }> {
    const params = category && category !== 'all' ? { category } : {};
    const response = await api.get('/v1/admin/whatsapp-templates', { params });
    return response.data;
  },

  async getTemplate(id: number): Promise<{ success: boolean; data: WhatsAppTemplate }> {
    const response = await api.get(`/v1/admin/whatsapp-templates/${id}`);
    return response.data;
  },

  async createTemplate(data: Partial<WhatsAppTemplate>): Promise<{ success: boolean; message: string; data: WhatsAppTemplate }> {
    const response = await api.post('/v1/admin/whatsapp-templates', data);
    return response.data;
  },

  async updateTemplate(id: number, data: Partial<WhatsAppTemplate>): Promise<{ success: boolean; message: string; data: WhatsAppTemplate }> {
    const response = await api.put(`/v1/admin/whatsapp-templates/${id}`, data);
    return response.data;
  },

  async deleteTemplate(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/v1/admin/whatsapp-templates/${id}`);
    return response.data;
  },

  async submitToMeta(id: number, metaTemplateName: string): Promise<{ success: boolean; message: string; data: any }> {
    const response = await api.post(`/v1/admin/whatsapp-templates/${id}/submit-to-meta`, { meta_template_name: metaTemplateName });
    return response.data;
  },

  async checkMetaStatus(id: number): Promise<{ success: boolean; data: any }> {
    const response = await api.get(`/v1/admin/whatsapp-templates/${id}/check-status`);
    return response.data;
  },

  async testSend(phone: string, templateCode: string, variables?: any[]): Promise<{ success: boolean; message: string; data: any }> {
    const response = await api.post('/v1/admin/whatsapp/test-send', { phone, template_code: templateCode, variables });
    return response.data;
  },

  async getLogs(filters?: any): Promise<{ success: boolean; data: any }> {
    const response = await api.get('/v1/admin/whatsapp-logs', { params: filters });
    return response.data;
  },

  async getStats(): Promise<{ success: boolean; data: any }> {
    const response = await api.get('/v1/admin/whatsapp-stats');
    return response.data;
  },
};

// OTP Service
export const otpService = {
  async sendOtp(phone: string, purpose: string, channel: string = 'whatsapp'): Promise<{ success: boolean; message: string; data: any }> {
    const response = await api.post('/v1/otp/send', { phone, purpose, channel });
    return response.data;
  },

  async verifyOtp(phone: string, otp: string, purpose: string): Promise<{ success: boolean; message: string; data: any }> {
    const response = await api.post('/v1/otp/verify', { phone, otp, purpose });
    return response.data;
  },

  async resendOtp(phone: string, purpose: string, channel: string = 'whatsapp'): Promise<{ success: boolean; message: string; data: any }> {
    const response = await api.post('/v1/otp/resend', { phone, purpose, channel });
    return response.data;
  },
};

// Vendor Leave Management
export interface VendorLeave {
  id: number;
  vendor_id: number;
  from_date: string;
  to_date: string;
  reason?: string;
  type: 'holiday' | 'emergency' | 'medical' | 'other';
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
  admin_notes?: string;
  approved_by?: number;
  approved_at?: string;
  auto_reactivate: boolean;
  reactivated_at?: string;
  created_at: string;
  vendor: Vendor;
  approvedBy?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface VendorLeaveStats {
  pending: number;
  approved: number;
  active: number;
  completed: number;
  rejected: number;
}

export const vendorLeaveApi = {
  // Get all vendor leaves
  async getVendorLeaves(params?: {
    status?: string;
    type?: string;
    search?: string;
    page?: number;
  }): Promise<{ success: boolean; data: { data: VendorLeave[]; total: number } }> {
    const response = await api.get('/v1/admin/vendor-leaves', { params });
    return response.data;
  },

  // Get vendor leave statistics
  async getVendorLeaveStats(): Promise<{ success: boolean; data: VendorLeaveStats }> {
    const response = await api.get('/v1/admin/vendor-leaves/stats');
    return response.data;
  },

  // Approve vendor leave
  async approveVendorLeave(
    leaveId: number,
    adminNotes?: string
  ): Promise<{ success: boolean; message: string; data: VendorLeave }> {
    const response = await api.post(`/v1/admin/vendor-leaves/${leaveId}/approve`, {
      admin_notes: adminNotes,
    });
    return response.data;
  },

  // Reject vendor leave
  async rejectVendorLeave(
    leaveId: number,
    adminNotes: string
  ): Promise<{ success: boolean; message: string; data: VendorLeave }> {
    const response = await api.post(`/v1/admin/vendor-leaves/${leaveId}/reject`, {
      admin_notes: adminNotes,
    });
    return response.data;
  },

  // Complete vendor leave
  async completeVendorLeave(
    leaveId: number
  ): Promise<{ success: boolean; message: string; data: VendorLeave }> {
    const response = await api.post(`/v1/admin/vendor-leaves/${leaveId}/complete`);
    return response.data;
  },
};
