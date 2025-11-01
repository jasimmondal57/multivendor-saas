'use client';

import { useState, useEffect } from 'react';
import LeaveApplicationsSection from './LeaveApplicationsSection';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { adminService, AdminStats, Vendor, Product, Order, Customer, Review, Coupon, Category, Payment } from '@/lib/admin';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DataTable, { Column } from '@/components/admin/DataTable';
import AdvancedFilters, { Filter } from '@/components/admin/AdvancedFilters';
import DashboardWidgets from '@/components/admin/DashboardWidgets';
import MultiVendorInvoices from '@/components/admin/MultiVendorInvoices';
import ReportsAnalytics from '@/components/admin/ReportsAnalytics';
import SystemSettings from '@/components/admin/SystemSettings';
import VendorPayouts from '@/components/admin/VendorPayouts';
import RevenueManagement from '@/components/admin/RevenueManagement';
import TDSManagement from '@/components/admin/TDSManagement';
import PageBuilder from '@/components/admin/PageBuilder';
import BannerManagement from '@/components/admin/BannerManagement';
import MenuBuilder from '@/components/admin/MenuBuilder';
import AdminReturns from '@/components/admin/AdminReturns';
import SupportTickets from '@/components/admin/SupportTickets';
import { exportOrders, exportProducts, exportCustomers, exportVendors, exportToCSV } from '@/lib/exportUtils';

export default function AdminDashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Tab states for each section
  const [vendorTab, setVendorTab] = useState('all');
  const [productTab, setProductTab] = useState('all');
  const [orderTab, setOrderTab] = useState('all');
  const [customerTab, setCustomerTab] = useState('all');
  const [reportsAnalyticsTab, setReportsAnalyticsTab] = useState('reports');

  // View details states
  const [viewingVendor, setViewingVendor] = useState<Vendor | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

  // Product management states
  const [productSearch, setProductSearch] = useState('');
  const [productVendorFilter, setProductVendorFilter] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState('');
  const [productStockFilter, setProductStockFilter] = useState('');
  const [viewingProduct, setViewingProduct] = useState<any>(null);
  const [banningProduct, setBanningProduct] = useState<any>(null);
  const [banReason, setBanReason] = useState('');

  // Order management states
  const [orderSearch, setOrderSearch] = useState('');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('');
  const [orderDateFilter, setOrderDateFilter] = useState('');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState<Order | null>(null);
  const [newOrderStatus, setNewOrderStatus] = useState('');
  const [generatingInvoice, setGeneratingInvoice] = useState<Order | null>(null);

  // Category management states
  const [categorySearch, setCategorySearch] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    parent_id: '',
    is_active: true,
    is_featured: false,
  });

  // Customer management states
  const [customerSearch, setCustomerSearch] = useState('');

  // Review management states
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('');

  // Payment management states
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    if (!user) {
      router.push('/admin/login');
      return;
    }

    if (user.user_type !== 'admin') {
      router.push('/');
      return;
    }

    setLoading(false);
    fetchDashboardData();
  }, [user, router, authLoading]);

  useEffect(() => {
    if (!loading && user) {
      fetchMenuData();
    }
  }, [activeMenu, vendorTab, productTab, orderTab, customerTab, loading, user]);

  useEffect(() => {
    if (user && user.user_type === 'admin') {
      fetchUnreadCount();
      // Refresh every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, ordersRes] = await Promise.all([
        adminService.getStats(),
        adminService.getOrders({ page: 1 })
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
      }

      if (ordersRes.success) {
        setOrders(ordersRes.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/v1/notifications/unread-count');
      if (response.data.success) {
        setUnreadCount(response.data.data.unread_count || 0);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const fetchMenuData = async () => {
    setDataLoading(true);
    try {
      switch (activeMenu) {
        case 'vendors':
          const vendorParams: any = { page: 1 };
          if (vendorTab !== 'all') vendorParams.status = vendorTab;
          const vendorsRes = await adminService.getVendors(vendorParams);
          if (vendorsRes.success) setVendors(vendorsRes.data.data);
          break;
        case 'products':
          const productParams: any = { page: 1 };
          if (productTab !== 'all') productParams.approval_status = productTab;
          const productsRes = await adminService.getProducts(productParams);
          if (productsRes.success) {
            // Map backend 'status' field to frontend 'approval_status' for consistency
            const mappedProducts = productsRes.data.data.map((p: any) => ({
              ...p,
              approval_status: p.status === 'pending_review' ? 'pending' : p.status
            }));
            setProducts(mappedProducts);
          }
          break;
        case 'orders':
          const orderParams: any = { page: 1 };
          if (orderTab !== 'all') orderParams.status = orderTab;
          const ordersRes = await adminService.getOrders(orderParams);
          if (ordersRes.success) setOrders(ordersRes.data.data);
          break;
        case 'customers':
          const customerParams: any = { page: 1 };
          if (customerTab !== 'all') customerParams.status = customerTab;
          const customersRes = await adminService.getCustomers(customerParams);
          if (customersRes.success) setCustomers(customersRes.data.data);
          break;
        case 'reviews':
          const reviewsRes = await adminService.getReviews({ page: 1 });
          if (reviewsRes.success) setReviews(reviewsRes.data.data);
          break;
        case 'coupons':
          const couponsRes = await adminService.getCoupons({ page: 1 });
          if (couponsRes.success) setCoupons(couponsRes.data.data);
          break;
        case 'categories':
          const categoriesRes = await adminService.getCategories({ page: 1 });
          if (categoriesRes.success) setCategories(categoriesRes.data.data);
          break;
        case 'payments':
          const paymentsRes = await adminService.getPayments({ page: 1 });
          if (paymentsRes.success) setPayments(paymentsRes.data.data);
          break;
      }
    } catch (error) {
      console.error('Failed to fetch menu data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  // Menu items with SVG icons - badges will be populated from stats
  const getMenuItems = () => [
    { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'vendors', label: 'Vendors', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', badge: stats?.pending_vendors || 0 },
    { id: 'leave-applications', label: 'Leave Applications', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', badge: stats?.pending_products || 0 },
    { id: 'orders', label: 'Orders', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { id: 'customers', label: 'Customers', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'categories', label: 'Categories', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
    { id: 'reviews', label: 'Reviews', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
    { id: 'coupons', label: 'Coupons', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' },
    { id: 'payments', label: 'Payments', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { id: 'revenue', label: 'Revenue Management', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'tds', label: 'TDS Management', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { id: 'payouts', label: 'Vendor Payouts', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
    { id: 'returns', label: 'Return Management', icon: 'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6' },
    { id: 'support', label: 'Help & Support', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z', badge: unreadCount },
    { id: 'pages', label: 'Page Builder', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { id: 'banners', label: 'Banner Management', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'menus', label: 'Menu Builder', icon: 'M4 6h16M4 12h16M4 18h16' },
    { id: 'reports', label: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'analytics', label: 'Analytics', icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  ];

  const renderContent = () => {
    if (dataLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading data...</p>
          </div>
        </div>
      );
    }

    switch (activeMenu) {
      case 'vendors':
        return renderVendors();
      case 'leave-applications':
        return <LeaveApplicationsSection />;
      case 'products':
        return renderProducts();
      case 'orders':
        return renderOrders();
      case 'customers':
        return renderCustomers();
      case 'reviews':
        return renderReviews();
      case 'coupons':
        return renderCoupons();
      case 'categories':
        return renderCategories();
      case 'payments':
        return renderPayments();
      case 'revenue':
        return <RevenueManagement />;
      case 'tds':
        return <TDSManagement />;
      case 'payouts':
        return <VendorPayouts />;
      case 'returns':
        return <AdminReturns />;
      case 'support':
        return <SupportTickets />;
      case 'pages':
        return <PageBuilder />;
      case 'banners':
        return <BannerManagement />;
      case 'menus':
        return <MenuBuilder />;
      case 'reports':
        return renderReports();
      case 'analytics':
        return renderAnalytics();
      case 'settings':
        return <SystemSettings activeTab={activeMenu} />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => {
    // Get low stock products (stock < 10)
    const lowStockProducts = products.filter(p => (p.stock_quantity || 0) < 10);

    // Get top products (sorted by stock quantity as proxy for sales)
    const topProducts = [...products]
      .sort((a, b) => (b.stock_quantity || 0) - (a.stock_quantity || 0))
      .slice(0, 5);

    // Get top vendors (active vendors)
    const topVendors = vendors.filter(v => v.status === 'active').slice(0, 5);

    return (
      <>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <div className="text-blue-100 text-sm">Total</div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats?.total_vendors || 0}</div>
            <div className="text-blue-100 text-sm mb-2">Active Vendors</div>
            {stats && stats.pending_vendors > 0 && (
              <div className="text-xs bg-blue-400 bg-opacity-50 rounded-full px-3 py-1 inline-block">
                {stats.pending_vendors} pending approval
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <div className="text-green-100 text-sm">Total</div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats?.total_customers.toLocaleString('en-IN') || 0}</div>
            <div className="text-green-100 text-sm">Registered Customers</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <div className="text-purple-100 text-sm">Total</div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats?.total_orders.toLocaleString('en-IN') || 0}</div>
            <div className="text-purple-100 text-sm">Total Orders</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <div className="text-orange-100 text-sm">Total</div>
            </div>
            <div className="text-3xl font-bold mb-1">₹{stats ? (stats.total_revenue / 100000).toFixed(1) : 0}L</div>
            <div className="text-orange-100 text-sm">Platform Revenue</div>
          </div>

          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-pink-100 text-sm">Pending</div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats?.pending_products || 0}</div>
            <div className="text-pink-100 text-sm">Products to Review</div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <div className="text-indigo-100 text-sm">Total</div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats?.total_products || 0}</div>
            <div className="text-indigo-100 text-sm">Total Products</div>
          </div>
        </div>

        {/* Dashboard Widgets */}
        <DashboardWidgets
          recentOrders={orders.slice(0, 10)}
          topProducts={topProducts}
          lowStockProducts={lowStockProducts}
          topVendors={topVendors}
        />

      </>
    );
  };

  const handleVendorAction = async (vendorId: number, action: 'approve' | 'reject' | 'activate' | 'deactivate' | 'suspend' | 'unsuspend') => {
    try {
      if (action === 'approve') {
        await adminService.approveVendor(vendorId);
        alert('Vendor approved successfully!');
      } else if (action === 'reject') {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;
        await adminService.rejectVendor(vendorId, reason);
        alert('Vendor rejected successfully!');
      } else if (action === 'activate') {
        await adminService.updateVendorStatus(vendorId, 'active');
        alert('Vendor activated successfully!');
      } else if (action === 'deactivate') {
        await adminService.updateVendorStatus(vendorId, 'inactive');
        alert('Vendor deactivated successfully!');
      } else if (action === 'suspend') {
        const reason = prompt('Enter suspension reason:');
        if (!reason) return;
        await adminService.suspendVendor(vendorId, reason);
        alert('Vendor suspended successfully!');
      } else if (action === 'unsuspend') {
        await adminService.updateVendorStatus(vendorId, 'active');
        alert('Vendor unsuspended successfully!');
      }

      // Close modal if open
      setViewingVendor(null);

      // Force refresh vendors list with cache busting
      const vendorParams: any = { page: 1, _t: Date.now() };
      if (vendorTab !== 'all') vendorParams.status = vendorTab;
      const vendorsRes = await adminService.getVendors(vendorParams);
      if (vendorsRes.success) setVendors(vendorsRes.data.data);
    } catch (error) {
      console.error('Failed to perform vendor action:', error);
      alert('Failed to perform action. Please try again.');
    }
  };

  const renderVendors = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Vendor Management</h3>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setVendorTab('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            vendorTab === 'all'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Vendors
        </button>
        <button
          onClick={() => setVendorTab('pending')}
          className={`px-4 py-2 font-medium transition-colors ${
            vendorTab === 'pending'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Pending Approval
        </button>
        <button
          onClick={() => setVendorTab('active')}
          className={`px-4 py-2 font-medium transition-colors ${
            vendorTab === 'active'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setVendorTab('inactive')}
          className={`px-4 py-2 font-medium transition-colors ${
            vendorTab === 'inactive'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Inactive
        </button>
        <button
          onClick={() => setVendorTab('suspended')}
          className={`px-4 py-2 font-medium transition-colors ${
            vendorTab === 'suspended'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Suspended
        </button>
        <button
          onClick={() => setVendorTab('rejected')}
          className={`px-4 py-2 font-medium transition-colors ${
            vendorTab === 'rejected'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Rejected
        </button>
      </div>

      {vendors.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Business Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Owner</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{vendor.business_name}</td>
                  <td className="py-3 px-4 text-gray-700">{vendor.user?.name || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-700">{vendor.user?.email || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      vendor.status === 'active' ? 'bg-green-100 text-green-700' :
                      vendor.status === 'suspended' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setViewingVendor(vendor)}
                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                      >
                        View Details
                      </button>

                      {/* Pending vendors - show Approve and Reject */}
                      {vendor.verification_status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleVendorAction(vendor.id, 'approve')}
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleVendorAction(vendor.id, 'reject')}
                            className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}

                      {/* Active vendors - show Deactivate and Suspend */}
                      {vendor.status === 'active' && vendor.verification_status === 'approved' && (
                        <>
                          <button
                            onClick={() => handleVendorAction(vendor.id, 'deactivate')}
                            className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                          >
                            Deactivate
                          </button>
                          <button
                            onClick={() => handleVendorAction(vendor.id, 'suspend')}
                            className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                          >
                            Suspend
                          </button>
                        </>
                      )}

                      {/* Suspended vendors - show Unsuspend */}
                      {vendor.status === 'suspended' && (
                        <button
                          onClick={() => handleVendorAction(vendor.id, 'unsuspend')}
                          className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                        >
                          Unsuspend
                        </button>
                      )}

                      {/* Inactive vendors - show Activate */}
                      {vendor.status === 'inactive' && vendor.verification_status === 'approved' && (
                        <button
                          onClick={() => handleVendorAction(vendor.id, 'activate')}
                          className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">No vendors found</p>
      )}
    </div>
  );

  const handleProductAction = async (productId: number, action: 'approve' | 'reject' | 'ban' | 'unban', reason?: string) => {
    try {
      if (action === 'approve') {
        await adminService.approveProduct(productId);
        alert('Product approved successfully!');
      } else if (action === 'reject') {
        await adminService.rejectProduct(productId);
        alert('Product rejected successfully!');
      } else if (action === 'ban') {
        await adminService.banProduct(productId, reason || 'Banned by admin');
        alert('Product banned successfully!');
      } else if (action === 'unban') {
        await adminService.unbanProduct(productId);
        alert('Product unbanned successfully!');
      }
      // Refresh products list
      fetchMenuData();
    } catch (error) {
      console.error('Failed to perform product action:', error);
      alert('Failed to perform action. Please try again.');
    }
  };

  const handleOrderStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      alert('Order status updated successfully!');
      // Refresh orders list
      fetchMenuData();
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const renderProducts = () => {
    const filteredProducts = products.filter(product => {
      const matchesSearch = !productSearch ||
        product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        product.slug.toLowerCase().includes(productSearch.toLowerCase()) ||
        (product as any).sku?.toLowerCase().includes(productSearch.toLowerCase());

      const matchesVendor = !productVendorFilter ||
        product.vendor.id.toString() === productVendorFilter;

      const matchesCategory = !productCategoryFilter ||
        product.category.name === productCategoryFilter;

      const matchesStatus = !productStatusFilter ||
        (product as any).status === productStatusFilter;

      const matchesStock = !productStockFilter ||
        (product as any).stock_status === productStockFilter;

      return matchesSearch && matchesVendor && matchesCategory && matchesStatus && matchesStock;
    });

    const uniqueVendors = Array.from(new Set(products.map(p => JSON.stringify({ id: p.vendor.id, name: p.vendor.user.name }))))
      .map(v => JSON.parse(v));
    const uniqueCategories = Array.from(new Set(products.map(p => p.category.name)));

    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Product Management</h3>
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold">{filteredProducts.length}</span> products
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setProductTab('all')}
            className={`px-4 py-2 font-medium transition-colors ${
              productTab === 'all'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => setProductTab('pending')}
            className={`px-4 py-2 font-medium transition-colors ${
              productTab === 'pending'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending Approval
          </button>
          <button
            onClick={() => setProductTab('approved')}
            className={`px-4 py-2 font-medium transition-colors ${
              productTab === 'approved'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setProductTab('rejected')}
            className={`px-4 py-2 font-medium transition-colors ${
              productTab === 'rejected'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Rejected
          </button>
          <button
            onClick={() => setProductTab('banned')}
            className={`px-4 py-2 font-medium transition-colors ${
              productTab === 'banned'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Banned
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name, SKU, slug..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />

          <select
            value={productVendorFilter}
            onChange={(e) => setProductVendorFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Vendors</option>
            {uniqueVendors.map((vendor: any) => (
              <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
            ))}
          </select>

          <select
            value={productCategoryFilter}
            onChange={(e) => setProductCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={productStatusFilter}
            onChange={(e) => setProductStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="banned">Banned</option>
          </select>

          <select
            value={productStockFilter}
            onChange={(e) => setProductStockFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Stock Status</option>
            <option value="in_stock">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
            <option value="low_stock">Low Stock</option>
          </select>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Product Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Vendor</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Stock Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Approval</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-600 text-sm">#{product.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.slug}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{product.category.name}</td>
                    <td className="py-3 px-4 text-gray-700">{product.vendor.user.name}</td>
                    <td className="py-3 px-4 font-semibold text-gray-900">₹{product.selling_price.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-gray-700">{product.stock_quantity}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        (product as any).stock_status === 'in_stock' ? 'bg-green-100 text-green-700' :
                        (product as any).stock_status === 'low_stock' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {(product as any).stock_status ? (product as any).stock_status.replace('_', ' ').toUpperCase() : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        product.approval_status === 'approved' ? 'bg-green-100 text-green-700' :
                        product.approval_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {product.approval_status ? product.approval_status.charAt(0).toUpperCase() + product.approval_status.slice(1) : 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        (product as any).status === 'active' ? 'bg-blue-100 text-blue-700' :
                        (product as any).status === 'banned' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {(product as any).status ? (product as any).status.charAt(0).toUpperCase() + (product as any).status.slice(1) : 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewingProduct(product)}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                          title="View Details"
                        >
                          View
                        </button>
                        {product.approval_status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleProductAction(product.id, 'approve')}
                              className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                              title="Approve Product"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleProductAction(product.id, 'reject')}
                              className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                              title="Reject Product"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {product.approval_status === 'rejected' && (
                          <button
                            onClick={() => handleProductAction(product.id, 'approve')}
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                            title="Approve Product"
                          >
                            Approve
                          </button>
                        )}
                        {product.approval_status === 'approved' && (product as any).status !== 'banned' && (
                          <button
                            onClick={() => setBanningProduct(product)}
                            className="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
                            title="Ban Product"
                          >
                            Ban
                          </button>
                        )}
                        {(product as any).status === 'banned' && (
                          <button
                            onClick={() => handleProductAction(product.id, 'unban')}
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                            title="Unban Product"
                          >
                            Unban
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No products found</p>
        )}

        {/* View Product Modal */}
        {viewingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Product Details</h3>
                <button
                  onClick={() => setViewingProduct(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Product ID:</span>
                      <span className="ml-2 font-medium">#{viewingProduct.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">SKU:</span>
                      <span className="ml-2 font-medium">{(viewingProduct as any).sku || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">{viewingProduct.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Slug:</span>
                      <span className="ml-2 font-medium">{viewingProduct.slug}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Category:</span>
                      <span className="ml-2 font-medium">{viewingProduct.category.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Vendor:</span>
                      <span className="ml-2 font-medium">{viewingProduct.vendor.user.name}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Pricing</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Selling Price:</span>
                      <span className="ml-2 font-medium text-green-600">₹{viewingProduct.selling_price.toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">MRP:</span>
                      <span className="ml-2 font-medium">₹{((viewingProduct as any).mrp || viewingProduct.selling_price).toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Discount:</span>
                      <span className="ml-2 font-medium">{(viewingProduct as any).discount_percentage || 0}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600">GST:</span>
                      <span className="ml-2 font-medium">{(viewingProduct as any).gst_percentage || 0}%</span>
                    </div>
                  </div>
                </div>

                {/* Stock */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Stock Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Stock Quantity:</span>
                      <span className="ml-2 font-medium">{viewingProduct.stock_quantity}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Stock Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                        (viewingProduct as any).stock_status === 'in_stock' ? 'bg-green-100 text-green-700' :
                        (viewingProduct as any).stock_status === 'low_stock' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {(viewingProduct as any).stock_status ? (viewingProduct as any).stock_status.replace('_', ' ').toUpperCase() : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Low Stock Threshold:</span>
                      <span className="ml-2 font-medium">{(viewingProduct as any).low_stock_threshold || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Status</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Approval Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                        viewingProduct.approval_status === 'approved' ? 'bg-green-100 text-green-700' :
                        viewingProduct.approval_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {viewingProduct.approval_status ? viewingProduct.approval_status.charAt(0).toUpperCase() + viewingProduct.approval_status.slice(1) : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Product Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                        (viewingProduct as any).status === 'active' ? 'bg-blue-100 text-blue-700' :
                        (viewingProduct as any).status === 'banned' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {(viewingProduct as any).status ? (viewingProduct as any).status.charAt(0).toUpperCase() + (viewingProduct as any).status.slice(1) : 'Active'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Featured:</span>
                      <span className="ml-2 font-medium">{(viewingProduct as any).is_featured ? 'Yes' : 'No'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Trending:</span>
                      <span className="ml-2 font-medium">{(viewingProduct as any).is_trending ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Additional Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">HSN Code:</span>
                      <span className="ml-2 font-medium">{(viewingProduct as any).hsn_code || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Weight:</span>
                      <span className="ml-2 font-medium">{(viewingProduct as any).weight ? `${(viewingProduct as any).weight}g` : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Returnable:</span>
                      <span className="ml-2 font-medium">{(viewingProduct as any).is_returnable ? 'Yes' : 'No'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Return Period:</span>
                      <span className="ml-2 font-medium">{(viewingProduct as any).return_period_days ? `${(viewingProduct as any).return_period_days} days` : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {(viewingProduct as any).description && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
                    <p className="text-sm text-gray-700">{(viewingProduct as any).description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Ban Product Modal */}
        {banningProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Ban Product</h3>
              </div>

              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to ban <strong>{banningProduct.name}</strong>?
                </p>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Enter reason for banning (required)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                  rows={4}
                  required
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (!banReason.trim()) {
                        alert('Please enter a reason for banning');
                        return;
                      }
                      handleProductAction(banningProduct.id, 'ban', banReason);
                      setBanningProduct(null);
                      setBanReason('');
                    }}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    Ban Product
                  </button>
                  <button
                    onClick={() => {
                      setBanningProduct(null);
                      setBanReason('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderOrders = () => {
    const filteredOrders = orders.filter(order => {
      const matchesSearch = !orderSearch ||
        (order.order_number || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
        (order.customer?.name || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
        (order.customer?.email || '').toLowerCase().includes(orderSearch.toLowerCase());

      const matchesPayment = !orderPaymentFilter ||
        order.payment_method === orderPaymentFilter;

      const matchesDate = !orderDateFilter ||
        new Date(order.created_at).toLocaleDateString('en-IN') === new Date(orderDateFilter).toLocaleDateString('en-IN');

      return matchesSearch && matchesPayment && matchesDate;
    });

    const uniquePaymentMethods = Array.from(new Set(orders.map(o => o.payment_method).filter(Boolean)));

    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Order Management</h3>
          <div className="text-sm text-gray-600">
            Total: <span className="font-semibold">{filteredOrders.length}</span> orders
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setOrderTab('all')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              orderTab === 'all'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setOrderTab('pending')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              orderTab === 'pending'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setOrderTab('confirmed')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              orderTab === 'confirmed'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Confirmed
          </button>
          <button
            onClick={() => setOrderTab('processing')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              orderTab === 'processing'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Processing
          </button>
          <button
            onClick={() => setOrderTab('shipped')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              orderTab === 'shipped'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Shipped
          </button>
          <button
            onClick={() => setOrderTab('delivered')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              orderTab === 'delivered'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Delivered
          </button>
          <button
            onClick={() => setOrderTab('cancelled')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              orderTab === 'cancelled'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Cancelled
          </button>
          <button
            onClick={() => setOrderTab('refunded')}
            className={`px-4 py-2 font-medium transition-colors whitespace-nowrap ${
              orderTab === 'refunded'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Refunded
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by order ID, customer name, email..."
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />

          <select
            value={orderPaymentFilter}
            onChange={(e) => setOrderPaymentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">All Payment Methods</option>
            {uniquePaymentMethods.map((method) => (
              <option key={method} value={method}>{method.toUpperCase()}</option>
            ))}
          </select>

          <input
            type="date"
            value={orderDateFilter}
            onChange={(e) => setOrderDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Filter by date"
          />
        </div>

        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Items</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{order.order_number}</div>
                      <div className="text-xs text-gray-500">ID: #{order.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{order.customer?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{order.customer?.email || 'N/A'}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-900">₹{(order.total_amount || 0).toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                        {(order.payment_method || 'N/A').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'confirmed' ? 'bg-cyan-100 text-cyan-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        order.status === 'refunded' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-700">{new Date(order.created_at).toLocaleDateString('en-IN')}</div>
                      <div className="text-xs text-gray-500">{new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setViewingOrder(order)}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                          title="View Details"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setGeneratingInvoice(order)}
                          className="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
                          title="Download Invoice"
                        >
                          Invoice
                        </button>
                        {order.status !== 'delivered' && order.status !== 'cancelled' && order.status !== 'refunded' && (
                          <button
                            onClick={() => {
                              setUpdatingOrderStatus(order);
                              setNewOrderStatus(order.status);
                            }}
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                            title="Update Status"
                          >
                            Update
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No orders found</p>
        )}

        {/* View Order Modal */}
        {viewingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Order Details - {viewingOrder.order_number}</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setGeneratingInvoice(viewingOrder);
                      setViewingOrder(null);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium text-sm flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Invoice
                  </button>
                  <button
                    onClick={() => setViewingOrder(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Order Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Order Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Order ID:</span>
                      <span className="ml-2 font-medium">#{viewingOrder.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Order Number:</span>
                      <span className="ml-2 font-medium">{viewingOrder.order_number}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                        viewingOrder.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        viewingOrder.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        viewingOrder.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                        viewingOrder.status === 'confirmed' ? 'bg-cyan-100 text-cyan-700' :
                        viewingOrder.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        viewingOrder.status === 'refunded' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {viewingOrder.status.charAt(0).toUpperCase() + viewingOrder.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="ml-2 font-medium">{(viewingOrder.payment_method || 'N/A').toUpperCase()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Order Date:</span>
                      <span className="ml-2 font-medium">{new Date(viewingOrder.created_at).toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="ml-2 font-medium text-green-600">₹{(viewingOrder.total_amount || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">{viewingOrder.customer?.name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 font-medium">{viewingOrder.customer?.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                {viewingOrder.items && viewingOrder.items.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">Product</th>
                            <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">Quantity</th>
                            <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">Price</th>
                            <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewingOrder.items.map((item) => (
                            <tr key={item.id} className="border-t border-gray-200">
                              <td className="py-2 px-4 text-sm">{item.product_name || 'N/A'}</td>
                              <td className="py-2 px-4 text-sm">{item.quantity || 0}</td>
                              <td className="py-2 px-4 text-sm">₹{(item.price || 0).toLocaleString('en-IN')}</td>
                              <td className="py-2 px-4 text-sm font-semibold">₹{(item.total_price || (item.price || 0) * (item.quantity || 0)).toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                          <tr>
                            <td colSpan={3} className="py-2 px-4 text-sm font-semibold text-right">Total:</td>
                            <td className="py-2 px-4 text-sm font-bold text-green-600">₹{(viewingOrder.total_amount || 0).toLocaleString('en-IN')}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Update Order Status Modal */}
        {updatingOrderStatus && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Update Order Status</h3>
              </div>

              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  Update status for order <strong>{updatingOrderStatus.order_number}</strong>
                </p>
                <select
                  value={newOrderStatus}
                  onChange={(e) => setNewOrderStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      handleOrderStatusUpdate(updatingOrderStatus.id, newOrderStatus);
                      setUpdatingOrderStatus(null);
                    }}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Update Status
                  </button>
                  <button
                    onClick={() => setUpdatingOrderStatus(null)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Generator Modal */}
        {generatingInvoice && (
          <MultiVendorInvoices
            order={generatingInvoice}
            onClose={() => setGeneratingInvoice(null)}
          />
        )}
      </div>
    );
  };

  const handleUserAction = async (userId: number, action: 'activate' | 'deactivate' | 'ban' | 'unban') => {
    try {
      await adminService.updateUserStatus(userId, action);
      alert(`User ${action}d successfully!`);
      // Refresh customers list
      fetchMenuData();
    } catch (error) {
      console.error('Failed to perform user action:', error);
      alert('Failed to perform action. Please try again.');
    }
  };

  const renderCustomers = () => {
    const filteredCustomers = customers.filter(customer =>
      !customerSearch ||
      (customer.name || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
      (customer.email || '').toLowerCase().includes(customerSearch.toLowerCase())
    );

    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Customer Management</h3>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setCustomerTab('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            customerTab === 'all'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Customers
        </button>
        <button
          onClick={() => setCustomerTab('active')}
          className={`px-4 py-2 font-medium transition-colors ${
            customerTab === 'active'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setCustomerTab('inactive')}
          className={`px-4 py-2 font-medium transition-colors ${
            customerTab === 'inactive'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Inactive
        </button>
        <button
          onClick={() => setCustomerTab('banned')}
          className={`px-4 py-2 font-medium transition-colors ${
            customerTab === 'banned'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Banned
        </button>
      </div>

      {filteredCustomers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Joined</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{customer.name}</td>
                  <td className="py-3 px-4 text-gray-700">{customer.email}</td>
                  <td className="py-3 px-4 text-gray-700">{customer.phone || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      customer.status === 'active' ? 'bg-green-100 text-green-700' :
                      customer.status === 'banned' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{new Date(customer.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewingCustomer(customer)}
                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                      >
                        View Details
                      </button>
                      {customer.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleUserAction(customer.id, 'deactivate')}
                            className="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
                          >
                            Deactivate
                          </button>
                          <button
                            onClick={() => handleUserAction(customer.id, 'ban')}
                            className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                          >
                            Ban
                          </button>
                        </>
                      )}
                      {customer.status === 'inactive' && (
                        <>
                          <button
                            onClick={() => handleUserAction(customer.id, 'activate')}
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                          >
                            Activate
                          </button>
                          <button
                            onClick={() => handleUserAction(customer.id, 'ban')}
                            className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                          >
                            Ban
                          </button>
                        </>
                      )}
                      {customer.status === 'banned' && (
                        <button
                          onClick={() => handleUserAction(customer.id, 'unban')}
                          className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                        >
                          Unban
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">No customers found</p>
      )}
    </div>
    );
  };

  const renderReviews = () => {
    const filteredReviews = reviews.filter(review =>
      !reviewSearch ||
      (review.user?.name || '').toLowerCase().includes(reviewSearch.toLowerCase()) ||
      (review.product?.name || '').toLowerCase().includes(reviewSearch.toLowerCase())
    );

    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Reviews Management</h3>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by customer or product name..."
            value={reviewSearch}
            onChange={(e) => setReviewSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {filteredReviews.length > 0 ? (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{review.user.name}</p>
                  <p className="text-sm text-gray-600">{review.product.name}</p>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-gray-700">{review.review}</p>
              <p className="text-xs text-gray-500 mt-2">{new Date(review.created_at).toLocaleDateString('en-IN')}</p>
            </div>
          ))}
        </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No reviews found</p>
        )}
      </div>
    );
  };

  const renderCoupons = () => (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">All Coupons</h3>
      {coupons.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Code</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Discount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Min Order</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Usage</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Valid Until</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{coupon.code}</td>
                  <td className="py-3 px-4 text-gray-700">
                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                  </td>
                  <td className="py-3 px-4 text-gray-700">₹{coupon.min_order_value}</td>
                  <td className="py-3 px-4 text-gray-700">{coupon.usage_count}/{coupon.usage_limit || '∞'}</td>
                  <td className="py-3 px-4 text-gray-700">{new Date(coupon.valid_until).toLocaleDateString('en-IN')}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {coupon.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">No coupons found</p>
      )}
    </div>
  );

  const renderCategories = () => {
    const filteredCategories = categories.filter(category =>
      !categorySearch || category.name.toLowerCase().includes(categorySearch.toLowerCase())
    );

    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Categories Management</h3>
          <button
            onClick={() => setCreatingCategory(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            + Add Category
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search categories..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Categories Table */}
        {filteredCategories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Slug</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Parent</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Products</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Featured</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-700">#{category.id}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{category.name}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{category.slug}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {category.parent?.name || '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-700">{category.products_count || 0}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        category.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {category.is_featured ? (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                          ⭐ Featured
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingCategory(category)}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Toggle status for "${category.name}"?`)) {
                              try {
                                await adminService.toggleCategoryStatus(category.id);
                                alert('Category status updated!');
                                fetchMenuData();
                              } catch (error) {
                                alert('Failed to update category status');
                              }
                            }
                          }}
                          className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                        >
                          Toggle
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">No categories found</p>
        )}

        {/* Create Category Modal */}
        {creatingCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Create New Category</h3>
                <button onClick={() => setCreatingCategory(false)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="e.g., Electronics"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows={3}
                      placeholder="Category description..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parent Category</label>
                    <select
                      value={newCategory.parent_id}
                      onChange={(e) => setNewCategory({ ...newCategory, parent_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">None (Top Level)</option>
                      {categories.filter(c => !c.parent_id).map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newCategory.is_active}
                        onChange={(e) => setNewCategory({ ...newCategory, is_active: e.target.checked })}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newCategory.is_featured}
                        onChange={(e) => setNewCategory({ ...newCategory, is_featured: e.target.checked })}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">Featured</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={async () => {
                      if (!newCategory.name) {
                        alert('Please enter category name');
                        return;
                      }
                      try {
                        await adminService.createCategory({
                          name: newCategory.name,
                          description: newCategory.description,
                          parent_id: newCategory.parent_id || null,
                          is_active: newCategory.is_active,
                          is_featured: newCategory.is_featured,
                        });
                        alert('Category created successfully!');
                        setCreatingCategory(false);
                        setNewCategory({ name: '', description: '', parent_id: '', is_active: true, is_featured: false });
                        fetchMenuData();
                      } catch (error) {
                        alert('Failed to create category');
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                  >
                    Create Category
                  </button>
                  <button
                    onClick={() => setCreatingCategory(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Category Modal */}
        {editingCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Edit Category</h3>
                <button onClick={() => setEditingCategory(null)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
                    <input
                      type="text"
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={editingCategory.description || ''}
                      onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parent Category</label>
                    <select
                      value={editingCategory.parent_id || ''}
                      onChange={(e) => setEditingCategory({ ...editingCategory, parent_id: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">None (Top Level)</option>
                      {categories.filter(c => !c.parent_id && c.id !== editingCategory.id).map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingCategory.is_active}
                        onChange={(e) => setEditingCategory({ ...editingCategory, is_active: e.target.checked })}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editingCategory.is_featured}
                        onChange={(e) => setEditingCategory({ ...editingCategory, is_featured: e.target.checked })}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">Featured</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={async () => {
                      if (!editingCategory.name) {
                        alert('Please enter category name');
                        return;
                      }
                      try {
                        await adminService.updateCategory(editingCategory.id, {
                          name: editingCategory.name,
                          description: editingCategory.description,
                          parent_id: editingCategory.parent_id || null,
                          is_active: editingCategory.is_active,
                          is_featured: editingCategory.is_featured,
                        });
                        alert('Category updated successfully!');
                        setEditingCategory(null);
                        fetchMenuData();
                      } catch (error) {
                        alert('Failed to update category');
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                  >
                    Update Category
                  </button>
                  <button
                    onClick={() => setEditingCategory(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPayments = () => {
    const filteredPayments = payments.filter(payment =>
      (!paymentSearch ||
        (payment.transaction_id || '').toLowerCase().includes(paymentSearch.toLowerCase()) ||
        (payment.order?.order_number || '').toLowerCase().includes(paymentSearch.toLowerCase()) ||
        (payment.order?.customer?.name || '').toLowerCase().includes(paymentSearch.toLowerCase())) &&
      (!paymentMethodFilter || payment.payment_method === paymentMethodFilter) &&
      (!paymentStatusFilter || payment.status === paymentStatusFilter)
    );

    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Management</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Total Payments</p>
              <p className="text-3xl font-bold text-green-900 mt-2">₹{(stats?.total_revenue || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Total Orders</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{stats?.total_orders || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">Total Products</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">{stats?.total_products || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by transaction ID, order, or customer..."
          value={paymentSearch}
          onChange={(e) => setPaymentSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
        <select
          value={paymentMethodFilter}
          onChange={(e) => setPaymentMethodFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="">All Payment Methods</option>
          <option value="cod">Cash on Delivery</option>
          <option value="upi">UPI</option>
          <option value="card">Card</option>
          <option value="netbanking">Net Banking</option>
          <option value="wallet">Wallet</option>
        </select>
        <select
          value={paymentStatusFilter}
          onChange={(e) => setPaymentStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Payment Transactions Table */}
      {filteredPayments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Transaction ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Order</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Method</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-sm text-gray-700">{payment.transaction_id || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-700">
                    <div>
                      <p className="font-medium">#{payment.order?.order_number || payment.order_id}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    <div>
                      <p className="font-medium">{payment.order?.customer?.name || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{payment.order?.customer?.email || ''}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-900">₹{(payment.amount || 0).toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      {(payment.payment_method || 'N/A').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      payment.status === 'completed' ? 'bg-green-100 text-green-700' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                      payment.status === 'refunded' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {payment.status ? payment.status.charAt(0).toUpperCase() + payment.status.slice(1) : 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600 text-sm">
                    {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-IN') : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-8 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <h4 className="text-lg font-semibold text-gray-700 mb-2">No Payment Transactions</h4>
          <p className="text-gray-600">No payment transactions found matching your filters</p>
        </div>
      )}
    </div>
    );
  };

  const renderReports = () => (
    <div className="space-y-6">
      {/* Sub-tabs for Reports and Analytics */}
      <div className="bg-white rounded-2xl shadow-lg p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setReportsAnalyticsTab('reports')}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              reportsAnalyticsTab === 'reports'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Reports
          </button>
          <button
            onClick={() => setReportsAnalyticsTab('analytics')}
            className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
              reportsAnalyticsTab === 'analytics'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Analytics
          </button>
        </div>
      </div>

      {/* Reports & Analytics Content */}
      <ReportsAnalytics activeSubTab={reportsAnalyticsTab} />
    </div>
  );

  const renderAnalytics = () => {
    // Analytics is now handled by ReportsAnalytics component
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setReportsAnalyticsTab('reports')}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                reportsAnalyticsTab === 'reports'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Reports
            </button>
            <button
              onClick={() => setReportsAnalyticsTab('analytics')}
              className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                reportsAnalyticsTab === 'analytics'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Analytics
            </button>
          </div>
        </div>
        <ReportsAnalytics activeSubTab={reportsAnalyticsTab} />
      </div>
    );
  };



  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white transition-all duration-300 flex flex-col overflow-hidden`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-lg">Admin Panel</h1>
                <p className="text-xs text-gray-400">Multi-Vendor SaaS</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {getMenuItems().map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    activeMenu === item.id ? 'bg-red-600 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  title={!sidebarOpen ? item.label : ''}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-left font-medium">{item.label}</span>
                      {item.badge && item.badge > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{item.badge}</span>}
                    </>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile & Toggle */}
        <div className="p-4 border-t border-gray-700">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center font-bold mx-auto mb-3">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className={`w-5 h-5 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            {sidebarOpen && <span className="text-sm">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
              <p className="text-sm text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button onClick={logout} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-8">
          {renderContent()}
        </div>
      </main>

      {/* Vendor Details Modal */}
      {viewingVendor && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">Vendor Details</h3>
              <button
                onClick={() => setViewingVendor(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Business Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Business Information
                </h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Business Name</label>
                    <p className="text-gray-900 font-medium">{viewingVendor.business_name}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Business Type</label>
                    <p className="text-gray-900 capitalize">{viewingVendor.business_type || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Category</label>
                    <p className="text-gray-900">{viewingVendor.business_category || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Owner Name</label>
                    <p className="text-gray-900">{viewingVendor.user?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Email</label>
                    <p className="text-gray-900 text-sm">{viewingVendor.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Phone</label>
                    <p className="text-gray-900">+91 {viewingVendor.user?.phone || viewingVendor.business_phone || 'N/A'}</p>
                  </div>
                  {viewingVendor.business_description && (
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-gray-600">Description</label>
                      <p className="text-gray-900 text-sm">{viewingVendor.business_description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Business Address
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-900">
                    {viewingVendor.business_address || 'N/A'}<br />
                    {viewingVendor.business_city}, {viewingVendor.business_state} - {viewingVendor.business_pincode}
                  </p>
                </div>
              </div>

              {/* Contact Person */}
              {(viewingVendor.contact_person_name || viewingVendor.contact_person_email || viewingVendor.contact_person_phone) && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Contact Person
                  </h4>
                  <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Name</label>
                      <p className="text-gray-900">{viewingVendor.contact_person_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Email</label>
                      <p className="text-gray-900 text-sm">{viewingVendor.contact_person_email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Phone</label>
                      <p className="text-gray-900">+91 {viewingVendor.contact_person_phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* KYC Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  KYC Information
                </h4>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="text-xs font-semibold text-gray-600">PAN Number</label>
                    <p className="text-gray-900 font-mono">{viewingVendor.pan_number || viewingVendor.pan || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">PAN Holder Name</label>
                    <p className="text-gray-900">{viewingVendor.pan_holder_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600">GST Registered</label>
                    <p className="text-gray-900">
                      {viewingVendor.gst_registered ? (
                        <span className="text-green-600 font-semibold">✓ Yes</span>
                      ) : (
                        <span className="text-gray-500">✗ No</span>
                      )}
                    </p>
                  </div>
                  {viewingVendor.gst_registered && viewingVendor.gstin && (
                    <div>
                      <label className="text-xs font-semibold text-gray-600">GSTIN</label>
                      <p className="text-gray-900 font-mono">{viewingVendor.gstin}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-semibold text-gray-600">KYC Status</label>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      viewingVendor.kyc_status === 'verified' ? 'bg-green-100 text-green-700' :
                      viewingVendor.kyc_status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {viewingVendor.kyc_status ? viewingVendor.kyc_status.charAt(0).toUpperCase() + viewingVendor.kyc_status.slice(1) : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Uploaded Documents
                </h4>
                {viewingVendor.kycDocuments && viewingVendor.kycDocuments.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {viewingVendor.kycDocuments.map((doc: any) => (
                      <div key={doc.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900 capitalize text-sm">
                              {doc.document_type.replace(/_/g, ' ')}
                            </p>
                            {doc.document_number && (
                              <p className="text-xs text-gray-600 font-mono">{doc.document_number}</p>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            doc.verification_status === 'verified' ? 'bg-green-100 text-green-700' :
                            doc.verification_status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {doc.verification_status}
                          </span>
                        </div>
                        {doc.document_url && (
                          <a
                            href={doc.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Document
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <p className="text-yellow-800 text-sm">⚠️ No documents uploaded</p>
                  </div>
                )}
              </div>

              {/* Bank Account */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Bank Account Details
                </h4>
                {viewingVendor.bankAccount ? (
                  <div className="grid grid-cols-2 gap-4 bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Account Holder</label>
                      <p className="text-gray-900 font-medium">{viewingVendor.bankAccount.account_holder_name}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Account Number</label>
                      <p className="text-gray-900 font-mono">{viewingVendor.bankAccount.account_number}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Bank Name</label>
                      <p className="text-gray-900">{viewingVendor.bankAccount.bank_name}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">IFSC Code</label>
                      <p className="text-gray-900 font-mono">{viewingVendor.bankAccount.ifsc_code}</p>
                    </div>
                    {viewingVendor.bankAccount.branch_name && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600">Branch</label>
                        <p className="text-gray-900">{viewingVendor.bankAccount.branch_name}</p>
                      </div>
                    )}
                    {viewingVendor.bankAccount.account_type && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600">Account Type</label>
                        <p className="text-gray-900 capitalize">{viewingVendor.bankAccount.account_type}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <p className="text-yellow-800 text-sm">⚠️ Bank account not provided</p>
                  </div>
                )}
              </div>

              {/* Store Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Store Information
                </h4>
                {viewingVendor.store ? (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-200">
                    <h5 className="text-lg font-bold text-gray-900 mb-2">{viewingVendor.store.store_name}</h5>
                    {viewingVendor.store.store_description && (
                      <p className="text-gray-700 text-sm mb-4">{viewingVendor.store.store_description}</p>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-lg p-3">
                        <label className="text-xs font-semibold text-gray-600">Support Email</label>
                        <p className="text-gray-900 text-sm">{viewingVendor.store.customer_support_email}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <label className="text-xs font-semibold text-gray-600">Support Phone</label>
                        <p className="text-gray-900">+91 {viewingVendor.store.customer_support_phone}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <p className="text-yellow-800 text-sm">⚠️ Store details not provided</p>
                  </div>
                )}
              </div>

              {/* Status & Statistics */}
              <div className="grid grid-cols-2 gap-6">
                {/* Status */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Status
                  </h4>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Current Status</label>
                      <p className="mt-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          viewingVendor.status === 'active' ? 'bg-green-100 text-green-700' :
                          viewingVendor.status === 'suspended' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {viewingVendor.status ? viewingVendor.status.charAt(0).toUpperCase() + viewingVendor.status.slice(1) : 'N/A'}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Verification</label>
                      <p className="mt-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          viewingVendor.verification_status === 'approved' ? 'bg-green-100 text-green-700' :
                          viewingVendor.verification_status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {viewingVendor.verification_status ? viewingVendor.verification_status.charAt(0).toUpperCase() + viewingVendor.verification_status.slice(1) : 'Pending'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Statistics
                  </h4>
                  <div className="space-y-2">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <label className="text-xs font-semibold text-blue-600">Total Sales</label>
                      <p className="text-xl font-bold text-blue-900">₹{viewingVendor.total_sales || 0}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <label className="text-xs font-semibold text-green-600">Total Orders</label>
                      <p className="text-xl font-bold text-green-900">{viewingVendor.total_orders || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {viewingVendor.verification_status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      handleVendorAction(viewingVendor.id, 'approve');
                      setViewingVendor(null);
                    }}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    ✓ Approve Vendor
                  </button>
                  <button
                    onClick={() => {
                      handleVendorAction(viewingVendor.id, 'reject');
                      setViewingVendor(null);
                    }}
                    className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    ✗ Reject Vendor
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {viewingCustomer && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-900">Customer Details</h3>
              <button
                onClick={() => setViewingCustomer(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-gray-900 font-medium">{viewingCustomer.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{viewingCustomer.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-gray-900">{viewingCustomer.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        viewingCustomer.status === 'active' ? 'bg-green-100 text-green-700' :
                        viewingCustomer.status === 'banned' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {viewingCustomer.status.charAt(0).toUpperCase() + viewingCustomer.status.slice(1)}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Member Since</label>
                    <p className="text-gray-900">{new Date(viewingCustomer.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email Verified</label>
                    <p className="text-gray-900">
                      {viewingCustomer.email_verified_at ? (
                        <span className="text-green-600">✓ Verified</span>
                      ) : (
                        <span className="text-red-600">✗ Not Verified</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Activity */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Account Activity</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Last Login</p>
                  <p className="text-gray-900 font-medium">
                    {viewingCustomer.last_login_at
                      ? new Date(viewingCustomer.last_login_at).toLocaleString('en-IN')
                      : 'Never logged in'
                    }
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium mb-2">Note</p>
                <p className="text-sm text-blue-900">
                  To view order history, addresses, and other detailed information,
                  use the dedicated customer management section.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
