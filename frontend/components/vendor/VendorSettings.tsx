'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
}

interface StoreData {
  business_name: string;
  description: string;
  business_address: string;
  business_city: string;
  business_state: string;
  business_pincode: string;
  business_phone: string;
  business_email: string;
}

interface BankData {
  account_holder_name: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  branch_name: string;
}

interface NotificationPrefs {
  order_notifications: boolean;
  email_notifications: boolean;
  whatsapp_notifications: boolean;
  marketing_emails: boolean;
}

export default function VendorSettings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
  });

  const [storeData, setStoreData] = useState<StoreData>({
    business_name: '',
    description: '',
    business_address: '',
    business_city: '',
    business_state: '',
    business_pincode: '',
    business_phone: '',
    business_email: '',
  });

  const [bankData, setBankData] = useState<BankData>({
    account_holder_name: '',
    account_number: '',
    ifsc_code: '',
    bank_name: '',
    branch_name: '',
  });

  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>({
    order_notifications: true,
    email_notifications: true,
    whatsapp_notifications: false,
    marketing_emails: false,
  });

  useEffect(() => {
    fetchProfile();
    fetchNotificationPreferences();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/v1/vendor/settings/profile');
      if (response.data.success) {
        const vendor = response.data.data;
        setProfileData({
          name: vendor.user?.name || '',
          email: vendor.user?.email || '',
          phone: vendor.user?.phone || '',
        });
        setStoreData({
          business_name: vendor.business_name || '',
          description: vendor.description || '',
          business_address: vendor.business_address || '',
          business_city: vendor.business_city || '',
          business_state: vendor.business_state || '',
          business_pincode: vendor.business_pincode || '',
          business_phone: vendor.business_phone || '',
          business_email: vendor.business_email || '',
        });
        if (vendor.bankAccount) {
          setBankData({
            account_holder_name: vendor.bankAccount.account_holder_name || '',
            account_number: vendor.bankAccount.account_number || '',
            ifsc_code: vendor.bankAccount.ifsc_code || '',
            bank_name: vendor.bankAccount.bank_name || '',
            branch_name: vendor.bankAccount.branch_name || '',
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const fetchNotificationPreferences = async () => {
    try {
      const response = await api.get('/v1/vendor/settings/notifications');
      if (response.data.success) {
        setNotificationPrefs(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put('/v1/vendor/settings/profile', profileData);
      if (response.data.success) {
        alert('Profile updated successfully!');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put('/v1/vendor/settings/store', storeData);
      if (response.data.success) {
        alert('Store details updated successfully!');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update store details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put('/v1/vendor/settings/bank', bankData);
      if (response.data.success) {
        alert('Bank details updated successfully!');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update bank details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put('/v1/vendor/settings/notifications', notificationPrefs);
      if (response.data.success) {
        alert('Notification preferences updated successfully!');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account and store settings</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex space-x-8">
          {['profile', 'store', 'bank', 'notifications'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
        {activeTab === 'profile' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Profile Information</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your phone"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'store' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Store Settings</h2>
            <form onSubmit={handleUpdateStore} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                <input
                  type="text"
                  value={storeData.business_name}
                  onChange={(e) => setStoreData({ ...storeData, business_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter business name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Store Description</label>
                <textarea
                  rows={4}
                  value={storeData.description}
                  onChange={(e) => setStoreData({ ...storeData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your store"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                <textarea
                  rows={3}
                  value={storeData.business_address}
                  onChange={(e) => setStoreData({ ...storeData, business_address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter business address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={storeData.business_city}
                    onChange={(e) => setStoreData({ ...storeData, business_city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={storeData.business_state}
                    onChange={(e) => setStoreData({ ...storeData, business_state: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="State"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                  <input
                    type="text"
                    value={storeData.business_pincode}
                    onChange={(e) => setStoreData({ ...storeData, business_pincode: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Pincode"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Phone</label>
                  <input
                    type="tel"
                    value={storeData.business_phone}
                    onChange={(e) => setStoreData({ ...storeData, business_phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Business Phone"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Email</label>
                <input
                  type="email"
                  value={storeData.business_email}
                  onChange={(e) => setStoreData({ ...storeData, business_email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Business Email"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'bank' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Bank Details</h2>
            <form onSubmit={handleUpdateBank} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                <input
                  type="text"
                  value={bankData.account_holder_name}
                  onChange={(e) => setBankData({ ...bankData, account_holder_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter account holder name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                <input
                  type="text"
                  value={bankData.account_number}
                  onChange={(e) => setBankData({ ...bankData, account_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter account number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                <input
                  type="text"
                  value={bankData.ifsc_code}
                  onChange={(e) => setBankData({ ...bankData, ifsc_code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter IFSC code"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <input
                  type="text"
                  value={bankData.bank_name}
                  onChange={(e) => setBankData({ ...bankData, bank_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter bank name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                <input
                  type="text"
                  value={bankData.branch_name}
                  onChange={(e) => setBankData({ ...bankData, branch_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter branch name"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
            <form onSubmit={handleUpdateNotifications} className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <div className="font-medium text-gray-900">Order Notifications</div>
                  <div className="text-sm text-gray-500">Get notified when you receive new orders</div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.order_notifications}
                  onChange={(e) => setNotificationPrefs({ ...notificationPrefs, order_notifications: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded"
                />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <div className="font-medium text-gray-900">Email Notifications</div>
                  <div className="text-sm text-gray-500">Receive email updates about your store</div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.email_notifications}
                  onChange={(e) => setNotificationPrefs({ ...notificationPrefs, email_notifications: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded"
                />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <div className="font-medium text-gray-900">WhatsApp Notifications</div>
                  <div className="text-sm text-gray-500">Get WhatsApp alerts for important updates</div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.whatsapp_notifications}
                  onChange={(e) => setNotificationPrefs({ ...notificationPrefs, whatsapp_notifications: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded"
                />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-gray-900">Marketing Emails</div>
                  <div className="text-sm text-gray-500">Receive tips and promotional content</div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationPrefs.marketing_emails}
                  onChange={(e) => setNotificationPrefs({ ...notificationPrefs, marketing_emails: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

