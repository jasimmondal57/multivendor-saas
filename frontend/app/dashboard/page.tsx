'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CustomerSupport from '@/components/customer/CustomerSupport';
import api from '@/lib/api';

interface DashboardStats {
  total_orders: number;
  wishlist_items: number;
  reviews_written: number;
  unread_notifications: number;
}

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price: string;
  total_amount: string;
}

interface RecentOrder {
  id: number;
  order_number: string;
  total_amount: string;
  status: string;
  payment_status: string;
  created_at: string;
  items: OrderItem[];
}

interface Review {
  id: number;
  product_id: number;
  rating: number;
  title: string | null;
  comment: string;
  status: string;
  created_at: string;
  product: {
    id: number;
    name: string;
    slug: string;
  };
  order: {
    id: number;
    order_number: string;
  } | null;
}

interface Notification {
  id: string;
  type: string;
  data: any;
  read_at: string | null;
  created_at: string;
}

interface Address {
  id: number;
  type: 'home' | 'work' | 'other';
  name: string;
  phone: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  landmark: string | null;
  is_default: boolean;
  created_at: string;
}

interface Settings {
  email_order_updates: boolean;
  email_promotional: boolean;
  email_newsletter: boolean;
  profile_public: boolean;
  show_purchase_history: boolean;
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    total_orders: 0,
    wishlist_items: 0,
    reviews_written: 0,
    unread_notifications: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressFormData, setAddressFormData] = useState({
    type: 'home' as 'home' | 'work' | 'other',
    name: '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    country: 'India',
  });

  // Indian states list
  const indianStates = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Andaman and Nicobar Islands',
    'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi',
    'Jammu and Kashmir',
    'Ladakh',
    'Lakshadweep',
    'Puducherry',
  ];
  const [addressSaving, setAddressSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    email_order_updates: true,
    email_promotional: true,
    email_newsletter: false,
    profile_public: false,
    show_purchase_history: false,
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchDashboardStats();
      fetchRecentOrders();
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && activeTab === 'reviews') {
      fetchReviews();
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (user && activeTab === 'notifications') {
      fetchNotifications();
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (user && activeTab === 'addresses') {
      fetchAddresses();
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (user && activeTab === 'settings') {
      fetchSettings();
    }
  }, [activeTab, user]);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/v1/customer/dashboard/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await api.get('/v1/customer/orders?per_page=5');
      setRecentOrders(response.data.data.data || []);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await api.get('/v1/customer/reviews');
      setReviews(response.data.data.data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/v1/customer/notifications');
      setNotifications(response.data.data.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await api.post('/v1/customer/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, read_at: new Date().toISOString() })));
      // Refresh stats to update unread count
      fetchDashboardStats();
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/v1/customer/addresses');
      setAddresses(response.data.data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setAddressesLoading(false);
    }
  };

  const deleteAddress = async (id: number) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      await api.delete(`/v1/customer/addresses/${id}`);
      // Remove from state
      setAddresses(addresses.filter(addr => addr.id !== id));
      // Refresh stats if needed
      fetchDashboardStats();
    } catch (error) {
      console.error('Error deleting address:', error);
      alert('Failed to delete address. Please try again.');
    }
  };

  const setDefaultAddress = async (id: number) => {
    try {
      await api.post(`/v1/customer/addresses/${id}/set-default`);
      // Update state
      setAddresses(addresses.map(addr => ({
        ...addr,
        is_default: addr.id === id
      })));
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('Failed to set default address. Please try again.');
    }
  };

  const openAddAddressModal = () => {
    setEditingAddress(null);
    setAddressFormData({
      type: 'home',
      name: user?.name || '',
      phone: user?.phone || '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      country: 'India',
    });
    setShowAddressModal(true);
  };

  const openEditAddressModal = (address: Address) => {
    setEditingAddress(address);
    setAddressFormData({
      type: address.type,
      name: address.name,
      phone: address.phone,
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark || '',
      country: address.country || 'India',
    });
    setShowAddressModal(true);
  };

  const closeAddressModal = () => {
    setShowAddressModal(false);
    setEditingAddress(null);
    setAddressFormData({
      type: 'home',
      name: '',
      phone: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      country: 'India',
    });
  };

  const handleAddressFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setAddressFormData({
      ...addressFormData,
      [e.target.name]: e.target.value,
    });
  };

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressSaving(true);

    try {
      if (editingAddress) {
        // Update existing address
        const response = await api.put(`/v1/customer/addresses/${editingAddress.id}`, addressFormData);
        setAddresses(addresses.map(addr =>
          addr.id === editingAddress.id ? response.data.data : addr
        ));
      } else {
        // Create new address
        const response = await api.post('/v1/customer/addresses', addressFormData);
        setAddresses([response.data.data, ...addresses]);
      }
      closeAddressModal();
      fetchDashboardStats();
    } catch (error: any) {
      console.error('Error saving address:', error);
      alert(error.response?.data?.message || 'Failed to save address. Please try again.');
    } finally {
      setAddressSaving(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get('/v1/customer/settings');
      setSettings(response.data.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<Settings>) => {
    setSettingsSaving(true);
    try {
      const response = await api.put('/v1/customer/settings', newSettings);
      setSettings(response.data.data);
    } catch (error) {
      console.error('Error updating settings:', error);
    } finally {
      setSettingsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const menuItems = [
    {
      id: 'overview',
      name: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'orders',
      name: 'My Orders',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      link: '/orders',
    },
    {
      id: 'wishlist',
      name: 'Wishlist',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      link: '/wishlist',
    },
    {
      id: 'profile',
      name: 'Profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 'addresses',
      name: 'Addresses',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: 'reviews',
      name: 'My Reviews',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
    {
      id: 'support',
      name: 'Help & Support',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.link) {
      router.push(item.link);
    } else {
      setActiveTab(item.id);
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="font-medium">Menu</span>
          </button>

          {/* Sidebar */}
          <aside className={`${isSidebarOpen ? 'block' : 'hidden'} lg:block lg:w-64 flex-shrink-0`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* User Info */}
              <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold">{user.name}</h3>
                    <p className="text-sm text-indigo-100">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <nav className="p-4 space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-indigo-50 text-indigo-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </button>
                ))}
              </nav>

              {/* Logout Button */}
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
                  <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}! 👋</h1>
                  <p className="text-indigo-100">Here's what's happening with your account today.</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                        {statsLoading ? (
                          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                        ) : (
                          <p className="text-2xl font-bold text-gray-900">{stats.total_orders}</p>
                        )}
                      </div>
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Wishlist Items</p>
                        {statsLoading ? (
                          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                        ) : (
                          <p className="text-2xl font-bold text-gray-900">{stats.wishlist_items}</p>
                        )}
                      </div>
                      <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Reviews Written</p>
                        {statsLoading ? (
                          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                        ) : (
                          <p className="text-2xl font-bold text-gray-900">{stats.reviews_written}</p>
                        )}
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Notifications</p>
                        {statsLoading ? (
                          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                        ) : (
                          <p className="text-2xl font-bold text-gray-900">{stats.unread_notifications}</p>
                        )}
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link
                      href="/products"
                      className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                    >
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Browse Products</p>
                        <p className="text-xs text-gray-500">Explore our catalog</p>
                      </div>
                    </Link>

                    <Link
                      href="/orders"
                      className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                    >
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Track Orders</p>
                        <p className="text-xs text-gray-500">View order status</p>
                      </div>
                    </Link>

                    <Link
                      href="/wishlist"
                      className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                    >
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">My Wishlist</p>
                        <p className="text-xs text-gray-500">Saved items</p>
                      </div>
                    </Link>

                    <Link
                      href="/cart"
                      className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                    >
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Shopping Cart</p>
                        <p className="text-xs text-gray-500">View cart items</p>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                    {recentOrders.length > 0 && (
                      <Link href="/orders" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                        View All
                      </Link>
                    )}
                  </div>

                  {ordersLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-20 bg-gray-200 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : recentOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <p className="text-gray-500 mb-4">No orders yet</p>
                      <Link
                        href="/products"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentOrders.map((order) => {
                        const getStatusColor = (status: string) => {
                          switch (status) {
                            case 'delivered': return 'bg-green-100 text-green-800';
                            case 'shipped': return 'bg-blue-100 text-blue-800';
                            case 'processing': return 'bg-yellow-100 text-yellow-800';
                            case 'cancelled': return 'bg-red-100 text-red-800';
                            default: return 'bg-gray-100 text-gray-800';
                          }
                        };

                        return (
                          <Link
                            key={order.id}
                            href={`/orders/${order.id}`}
                            className="block p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{order.order_number}</p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(order.created_at).toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-900">₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</p>
                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                              <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h2>

                <div className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-4xl">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                      <p className="text-gray-600">{user.email}</p>
                      <button className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                        Change Profile Picture
                      </button>
                    </div>
                  </div>

                  {/* Profile Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={user.name}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={user.email}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={user.phone || 'Not provided'}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                      <input
                        type="text"
                        value={user.user_type}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 capitalize"
                      />
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium text-gray-900">Email Verification</span>
                        </div>
                        {user.email_verified ? (
                          <span className="flex items-center gap-1 text-green-600 font-medium">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Verified
                          </span>
                        ) : (
                          <button className="text-indigo-600 hover:text-indigo-700 font-medium">
                            Verify Now
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="font-medium text-gray-900">Phone Verification</span>
                        </div>
                        {user.phone_verified ? (
                          <span className="flex items-center gap-1 text-green-600 font-medium">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Verified
                          </span>
                        ) : (
                          <button className="text-indigo-600 hover:text-indigo-700 font-medium">
                            Verify Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                      Edit Profile
                    </button>
                    <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Saved Addresses</h2>
                  <button
                    onClick={openAddAddressModal}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Address
                  </button>
                </div>

                {addressesLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-40 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-gray-500 mb-4">No saved addresses yet</p>
                    <p className="text-sm text-gray-400">Add an address to make checkout faster</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`border rounded-lg p-4 ${
                          address.is_default ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                              address.type === 'home' ? 'bg-green-100 text-green-800' :
                              address.type === 'work' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {address.type}
                            </span>
                            {address.is_default && (
                              <span className="px-2 py-1 text-xs font-medium bg-indigo-600 text-white rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditAddressModal(address)}
                              className="text-gray-400 hover:text-indigo-600 transition-colors"
                              title="Edit address"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteAddress(address.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete address"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p className="font-semibold text-gray-900">{address.name}</p>
                          <p className="text-gray-600">{address.phone}</p>
                          <p className="text-gray-600">
                            {address.address_line_1}
                            {address.address_line_2 && `, ${address.address_line_2}`}
                          </p>
                          {address.landmark && (
                            <p className="text-gray-600">Landmark: {address.landmark}</p>
                          )}
                          <p className="text-gray-600">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                          <p className="text-gray-600">{address.country}</p>
                        </div>
                        {!address.is_default && (
                          <button
                            onClick={() => setDefaultAddress(address.id)}
                            className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                          >
                            Set as Default
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Address Modal */}
                {showAddressModal && (
                  <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
                      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900">
                          {editingAddress ? 'Edit Address' : 'Add New Address'}
                        </h3>
                        <button
                          onClick={closeAddressModal}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <form onSubmit={saveAddress} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address Type *</label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="type"
                                  value="home"
                                  checked={addressFormData.type === 'home'}
                                  onChange={handleAddressFormChange}
                                  className="text-indigo-600"
                                />
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span className="text-sm">Home</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="type"
                                  value="work"
                                  checked={addressFormData.type === 'work'}
                                  onChange={handleAddressFormChange}
                                  className="text-indigo-600"
                                />
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm">Work</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="radio"
                                  name="type"
                                  value="other"
                                  checked={addressFormData.type === 'other'}
                                  onChange={handleAddressFormChange}
                                  className="text-indigo-600"
                                />
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-sm">Other</span>
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                            <input
                              type="text"
                              name="name"
                              value={addressFormData.name}
                              onChange={handleAddressFormChange}
                              required
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                            <input
                              type="tel"
                              name="phone"
                              value={addressFormData.phone}
                              onChange={handleAddressFormChange}
                              required
                              pattern="[0-9]{10}"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 1 *</label>
                            <input
                              type="text"
                              name="address_line_1"
                              value={addressFormData.address_line_1}
                              onChange={handleAddressFormChange}
                              required
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                            <input
                              type="text"
                              name="address_line_2"
                              value={addressFormData.address_line_2}
                              onChange={handleAddressFormChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                            <input
                              type="text"
                              name="city"
                              value={addressFormData.city}
                              onChange={handleAddressFormChange}
                              required
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                            <select
                              name="country"
                              value={addressFormData.country}
                              onChange={handleAddressFormChange}
                              required
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                            >
                              <option value="India">India</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                            <select
                              name="state"
                              value={addressFormData.state}
                              onChange={handleAddressFormChange}
                              required
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                            >
                              <option value="">Select State</option>
                              {indianStates.map((state) => (
                                <option key={state} value={state}>
                                  {state}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                            <input
                              type="text"
                              name="pincode"
                              value={addressFormData.pincode}
                              onChange={handleAddressFormChange}
                              required
                              pattern="[0-9]{6}"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Landmark</label>
                            <input
                              type="text"
                              name="landmark"
                              value={addressFormData.landmark}
                              onChange={handleAddressFormChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                          <button
                            type="submit"
                            disabled={addressSaving}
                            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                          >
                            {addressSaving ? 'Saving...' : (editingAddress ? 'Update Address' : 'Add Address')}
                          </button>
                          <button
                            type="button"
                            onClick={closeAddressModal}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">My Reviews</h2>

                {reviewsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-32 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <p className="text-gray-500 mb-4">No reviews yet</p>
                    <p className="text-sm text-gray-400 mb-6">Purchase products to leave reviews</p>
                    <Link
                      href="/products"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Browse Products
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <Link href={`/products/${review.product.slug}`} className="font-semibold text-gray-900 hover:text-indigo-600">
                              {review.product.name}
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(review.created_at).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                              {review.status === 'pending' && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                  Pending Approval
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {review.title && (
                          <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                        )}
                        <p className="text-gray-600 text-sm">{review.comment}</p>
                        {review.order && (
                          <p className="text-xs text-gray-400 mt-2">Order: {review.order.order_number}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                  {notifications.some(n => !n.read_at) && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {notificationsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <p className="text-gray-500 mb-4">No notifications</p>
                    <p className="text-sm text-gray-400">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((notification) => {
                      const data = typeof notification.data === 'string' ? JSON.parse(notification.data) : notification.data;
                      const isUnread = !notification.read_at;

                      return (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-lg border ${
                            isUnread ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isUnread ? 'bg-indigo-600' : 'bg-gray-400'
                            }`}>
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                {data.message || data.title || 'New notification'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(notification.created_at).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            {isUnread && (
                              <div className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0 mt-2"></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'support' && (
              <CustomerSupport />
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
                  {settingsSaving && (
                    <span className="text-sm text-gray-500">Saving...</span>
                  )}
                </div>

                {settingsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Email Notifications */}
                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                          <div>
                            <p className="font-medium text-gray-900">Order Updates</p>
                            <p className="text-sm text-gray-500">Get notified about order status changes</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.email_order_updates}
                            onChange={(e) => updateSettings({ email_order_updates: e.target.checked })}
                            className="w-5 h-5 text-indigo-600 rounded"
                          />
                        </label>
                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                          <div>
                            <p className="font-medium text-gray-900">Promotional Emails</p>
                            <p className="text-sm text-gray-500">Receive offers and discounts</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.email_promotional}
                            onChange={(e) => updateSettings({ email_promotional: e.target.checked })}
                            className="w-5 h-5 text-indigo-600 rounded"
                          />
                        </label>
                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                          <div>
                            <p className="font-medium text-gray-900">Newsletter</p>
                            <p className="text-sm text-gray-500">Get weekly newsletter with updates</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.email_newsletter}
                            onChange={(e) => updateSettings({ email_newsletter: e.target.checked })}
                            className="w-5 h-5 text-indigo-600 rounded"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Privacy Settings */}
                    <div className="border-b border-gray-200 pb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy</h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                          <div>
                            <p className="font-medium text-gray-900">Profile Visibility</p>
                            <p className="text-sm text-gray-500">Make your profile visible to other users</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.profile_public}
                            onChange={(e) => updateSettings({ profile_public: e.target.checked })}
                            className="w-5 h-5 text-indigo-600 rounded"
                          />
                        </label>
                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                          <div>
                            <p className="font-medium text-gray-900">Show Purchase History</p>
                            <p className="text-sm text-gray-500">Display your purchase history on your profile</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={settings.show_purchase_history}
                            onChange={(e) => updateSettings({ show_purchase_history: e.target.checked })}
                            className="w-5 h-5 text-indigo-600 rounded"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div>
                      <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
                      <div className="space-y-3">
                        <button className="w-full p-4 border-2 border-red-200 rounded-lg text-left hover:bg-red-50 transition-colors">
                          <p className="font-medium text-red-600">Deactivate Account</p>
                          <p className="text-sm text-gray-500">Temporarily disable your account</p>
                        </button>
                        <button className="w-full p-4 border-2 border-red-200 rounded-lg text-left hover:bg-red-50 transition-colors">
                          <p className="font-medium text-red-600">Delete Account</p>
                          <p className="text-sm text-gray-500">Permanently delete your account and data</p>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
