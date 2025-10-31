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

interface BankChangeRequest {
  id: number;
  status: string;
  new_account_holder_name: string;
  new_account_number: string;
  new_ifsc_code: string;
  new_bank_name: string;
  new_branch_name: string;
  cancelled_cheque_url: string;
  vendor_notes: string;
  admin_notes: string;
  rejection_reason: string;
  created_at: string;
}

export default function VendorSettings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  // Profile data
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
  });

  // Store data
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

  // Bank data
  const [bankData, setBankData] = useState<BankData | null>(null);
  const [pendingBankRequest, setPendingBankRequest] = useState<BankChangeRequest | null>(null);

  // Email change modals
  const [showEmailChangeModal, setShowEmailChangeModal] = useState(false);
  const [emailChangeStep, setEmailChangeStep] = useState(1); // 1: enter new email, 2: verify old, 3: verify new
  const [newEmail, setNewEmail] = useState('');
  const [oldEmailOtp, setOldEmailOtp] = useState('');
  const [newEmailOtp, setNewEmailOtp] = useState('');

  // Phone change modals
  const [showPhoneChangeModal, setShowPhoneChangeModal] = useState(false);
  const [phoneChangeStep, setPhoneChangeStep] = useState(1); // 1: enter new phone, 2: verify old, 3: verify new
  const [newPhone, setNewPhone] = useState('');
  const [oldPhoneOtp, setOldPhoneOtp] = useState('');
  const [newPhoneOtp, setNewPhoneOtp] = useState('');

  // Bank change request modal
  const [showBankChangeModal, setShowBankChangeModal] = useState(false);
  const [bankChangeData, setBankChangeData] = useState({
    new_account_holder_name: '',
    new_account_number: '',
    new_ifsc_code: '',
    new_bank_name: '',
    new_branch_name: '',
    new_account_type: 'current',
    vendor_notes: '',
  });
  const [cancelledCheque, setCancelledCheque] = useState<File | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchBankDetails();
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
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchBankDetails = async () => {
    try {
      const response = await api.get('/v1/vendor/settings/bank');
      if (response.data.success) {
        setBankData(response.data.data.current_bank);
        setPendingBankRequest(response.data.data.pending_request);
      }
    } catch (error) {
      console.error('Error fetching bank details:', error);
    }
  };

  const handleUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put('/v1/vendor/settings/store', storeData);
      if (response.data.success) {
        alert('Store details updated successfully');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update store details');
    } finally {
      setLoading(false);
    }
  };

  // Email change handlers
  const handleRequestEmailChange = async () => {
    if (!newEmail) {
      alert('Please enter new email');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/v1/vendor/settings/email/request-change', { new_email: newEmail });
      if (response.data.success) {
        alert('OTP sent to your current email address. Please check your inbox.');
        setEmailChangeStep(2);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOldEmailOtp = async () => {
    if (!oldEmailOtp) {
      alert('Please enter OTP');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/v1/vendor/settings/email/verify-old', { otp: oldEmailOtp });
      if (response.data.success) {
        alert('Old email verified! OTP sent to your new email address. Please check your inbox.');
        setEmailChangeStep(3);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyNewEmailOtp = async () => {
    if (!newEmailOtp) {
      alert('Please enter OTP');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/v1/vendor/settings/email/verify-new', { otp: newEmailOtp });
      if (response.data.success) {
        alert('Email updated successfully!');
        setShowEmailChangeModal(false);
        setEmailChangeStep(1);
        setNewEmail('');
        setOldEmailOtp('');
        setNewEmailOtp('');
        fetchProfile();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // Phone change handlers
  const handleRequestPhoneChange = async () => {
    if (!newPhone) {
      alert('Please enter new phone');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/v1/vendor/settings/phone/request-change', { new_phone: newPhone });
      if (response.data.success) {
        alert('WhatsApp OTP sent to your current phone number. Please check your WhatsApp.');
        setPhoneChangeStep(2);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOldPhoneOtp = async () => {
    if (!oldPhoneOtp) {
      alert('Please enter OTP');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/v1/vendor/settings/phone/verify-old', { otp: oldPhoneOtp });
      if (response.data.success) {
        alert('Old phone verified! WhatsApp OTP sent to your new phone number. Please check your WhatsApp.');
        setPhoneChangeStep(3);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyNewPhoneOtp = async () => {
    if (!newPhoneOtp) {
      alert('Please enter OTP');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/v1/vendor/settings/phone/verify-new', { otp: newPhoneOtp });
      if (response.data.success) {
        alert('Phone number updated successfully!');
        setShowPhoneChangeModal(false);
        setPhoneChangeStep(1);
        setNewPhone('');
        setOldPhoneOtp('');
        setNewPhoneOtp('');
        fetchProfile();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // Bank change request handler
  const handleSubmitBankChangeRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelledCheque) {
      alert('Please upload cancelled cheque');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('new_account_holder_name', bankChangeData.new_account_holder_name);
      formData.append('new_account_number', bankChangeData.new_account_number);
      formData.append('new_ifsc_code', bankChangeData.new_ifsc_code);
      formData.append('new_bank_name', bankChangeData.new_bank_name);
      formData.append('new_branch_name', bankChangeData.new_branch_name);
      formData.append('new_account_type', bankChangeData.new_account_type);
      formData.append('vendor_notes', bankChangeData.vendor_notes);
      formData.append('cancelled_cheque', cancelledCheque);

      const response = await api.post('/v1/vendor/bank-change-requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        alert('Bank change request submitted successfully!');
        setShowBankChangeModal(false);
        setBankChangeData({
          new_account_holder_name: '',
          new_account_number: '',
          new_ifsc_code: '',
          new_bank_name: '',
          new_branch_name: '',
          new_account_type: 'current',
          vendor_notes: '',
        });
        setCancelledCheque(null);
        fetchBankDetails();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and store settings</p>
      </div>

      {/* Tabs - Removed notifications */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {['profile', 'store', 'bank'].map((tab) => (
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
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
          <div className="space-y-4">
            {/* Name - Read-only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={profileData.name}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Name cannot be changed after registration</p>
            </div>

            {/* Email - Change button */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
                <button
                  onClick={() => setShowEmailChangeModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Change Email
                </button>
              </div>
            </div>

            {/* Phone - Change button */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={profileData.phone}
                  disabled
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
                <button
                  onClick={() => setShowPhoneChangeModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Change Phone
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Store Tab */}
      {activeTab === 'store' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Store Details</h2>
          <form onSubmit={handleUpdateStore} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
              <input
                type="text"
                value={storeData.business_name}
                onChange={(e) => setStoreData({ ...storeData, business_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={storeData.description}
                onChange={(e) => setStoreData({ ...storeData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Phone</label>
                <input
                  type="text"
                  value={storeData.business_phone}
                  onChange={(e) => setStoreData({ ...storeData, business_phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Email</label>
                <input
                  type="email"
                  value={storeData.business_email}
                  onChange={(e) => setStoreData({ ...storeData, business_email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={storeData.business_address}
                onChange={(e) => setStoreData({ ...storeData, business_address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={storeData.business_city}
                  onChange={(e) => setStoreData({ ...storeData, business_city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  value={storeData.business_state}
                  onChange={(e) => setStoreData({ ...storeData, business_state: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                <input
                  type="text"
                  value={storeData.business_pincode}
                  onChange={(e) => setStoreData({ ...storeData, business_pincode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Updating...' : 'Update Store Details'}
            </button>
          </form>
        </div>
      )}

      {/* Bank Tab */}
      {activeTab === 'bank' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Bank Account Details</h2>

          {/* Current Bank Details */}
          {bankData && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Current Bank Account</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Account Holder:</span>
                  <p className="font-medium">{bankData.account_holder_name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Account Number:</span>
                  <p className="font-medium">****{bankData.account_number?.slice(-4)}</p>
                </div>
                <div>
                  <span className="text-gray-600">IFSC Code:</span>
                  <p className="font-medium">{bankData.ifsc_code}</p>
                </div>
                <div>
                  <span className="text-gray-600">Bank Name:</span>
                  <p className="font-medium">{bankData.bank_name}</p>
                </div>
                {bankData.branch_name && (
                  <div>
                    <span className="text-gray-600">Branch:</span>
                    <p className="font-medium">{bankData.branch_name}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pending Request */}
          {pendingBankRequest && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-medium text-yellow-900 mb-2">Pending Bank Change Request</h3>
              <p className="text-sm text-yellow-700 mb-3">
                Your bank account change request is pending admin approval.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">New Account Holder:</span>
                  <p className="font-medium">{pendingBankRequest.new_account_holder_name}</p>
                </div>
                <div>
                  <span className="text-gray-600">New Account Number:</span>
                  <p className="font-medium">****{pendingBankRequest.new_account_number?.slice(-4)}</p>
                </div>
                <div>
                  <span className="text-gray-600">New IFSC Code:</span>
                  <p className="font-medium">{pendingBankRequest.new_ifsc_code}</p>
                </div>
                <div>
                  <span className="text-gray-600">New Bank Name:</span>
                  <p className="font-medium">{pendingBankRequest.new_bank_name}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Submitted on: {new Date(pendingBankRequest.created_at).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Request Bank Change Button */}
          {!pendingBankRequest && (
            <button
              onClick={() => setShowBankChangeModal(true)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Request Bank Account Change
            </button>
          )}
        </div>
      )}

      {/* Email Change Modal */}
      {showEmailChangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Change Email Address</h3>

            {emailChangeStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new email address"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowEmailChangeModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestEmailChange}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              </div>
            )}

            {emailChangeStep === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Enter the OTP sent to your current email address</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">OTP</label>
                  <input
                    type="text"
                    value={oldEmailOtp}
                    onChange={(e) => setOldEmailOtp(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowEmailChangeModal(false);
                      setEmailChangeStep(1);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerifyOldEmailOtp}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </div>
            )}

            {emailChangeStep === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Enter the OTP sent to your new email address</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">OTP</label>
                  <input
                    type="text"
                    value={newEmailOtp}
                    onChange={(e) => setNewEmailOtp(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowEmailChangeModal(false);
                      setEmailChangeStep(1);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerifyNewEmailOtp}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Verifying...' : 'Complete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Phone Change Modal */}
      {showPhoneChangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Change Phone Number</h3>

            {phoneChangeStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Phone Number</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new phone number"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPhoneChangeModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestPhoneChange}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Sending...' : 'Send WhatsApp OTP'}
                  </button>
                </div>
              </div>
            )}

            {phoneChangeStep === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Enter the WhatsApp OTP sent to your current phone number</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">OTP</label>
                  <input
                    type="text"
                    value={oldPhoneOtp}
                    onChange={(e) => setOldPhoneOtp(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowPhoneChangeModal(false);
                      setPhoneChangeStep(1);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerifyOldPhoneOtp}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
              </div>
            )}

            {phoneChangeStep === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Enter the WhatsApp OTP sent to your new phone number</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">OTP</label>
                  <input
                    type="text"
                    value={newPhoneOtp}
                    onChange={(e) => setNewPhoneOtp(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowPhoneChangeModal(false);
                      setPhoneChangeStep(1);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerifyNewPhoneOtp}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Verifying...' : 'Complete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bank Change Request Modal */}
      {showBankChangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4">
            <h3 className="text-lg font-semibold mb-4">Request Bank Account Change</h3>
            <form onSubmit={handleSubmitBankChangeRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                  <input
                    type="text"
                    value={bankChangeData.new_account_holder_name}
                    onChange={(e) => setBankChangeData({ ...bankChangeData, new_account_holder_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                  <input
                    type="text"
                    value={bankChangeData.new_account_number}
                    onChange={(e) => setBankChangeData({ ...bankChangeData, new_account_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                  <input
                    type="text"
                    value={bankChangeData.new_ifsc_code}
                    onChange={(e) => setBankChangeData({ ...bankChangeData, new_ifsc_code: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    maxLength={11}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                  <input
                    type="text"
                    value={bankChangeData.new_bank_name}
                    onChange={(e) => setBankChangeData({ ...bankChangeData, new_bank_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                  <input
                    type="text"
                    value={bankChangeData.new_branch_name}
                    onChange={(e) => setBankChangeData({ ...bankChangeData, new_branch_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                  <select
                    value={bankChangeData.new_account_type}
                    onChange={(e) => setBankChangeData({ ...bankChangeData, new_account_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="current">Current</option>
                    <option value="savings">Savings</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancelled Cheque <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setCancelledCheque(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Upload cancelled cheque (JPG, PNG, or PDF, max 2MB)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={bankChangeData.vendor_notes}
                  onChange={(e) => setBankChangeData({ ...bankChangeData, vendor_notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Any additional information for admin"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowBankChangeModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
