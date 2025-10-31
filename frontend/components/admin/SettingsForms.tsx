'use client';

import { useState } from 'react';

interface SettingsFormsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function SettingsForms({ activeTab, onTabChange }: SettingsFormsProps) {
  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Multi-Vendor E-commerce',
    siteTagline: 'Your One-Stop Shopping Destination',
    contactEmail: 'support@multivendor.com',
    contactPhone: '+91 1234567890',
    address: '123 Business Street, Mumbai, Maharashtra 400001',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    currencySymbol: '₹',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
  });

  // Payment Settings State
  const [paymentSettings, setPaymentSettings] = useState({
    razorpayEnabled: true,
    razorpayKeyId: '',
    razorpayKeySecret: '',
    stripeEnabled: false,
    stripePublishableKey: '',
    stripeSecretKey: '',
    paytmEnabled: false,
    paytmMerchantId: '',
    paytmMerchantKey: '',
    codEnabled: true,
    codMaxAmount: 50000,
    platformCommission: 10,
    gstPercentage: 18,
  });

  // Email Settings State
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    smtpEncryption: 'tls',
    fromEmail: 'noreply@multivendor.com',
    fromName: 'Multi-Vendor E-commerce',
    orderConfirmationEnabled: true,
    orderShippedEnabled: true,
    orderDeliveredEnabled: true,
    vendorApprovalEnabled: true,
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    ipWhitelist: '',
  });

  // Shipping Settings State
  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: 500,
    defaultShippingCharge: 50,
    expressShippingCharge: 100,
    internationalShippingEnabled: false,
    estimatedDeliveryDays: 7,
    trackingEnabled: true,
  });

  // Tax Settings State
  const [taxSettings, setTaxSettings] = useState({
    taxEnabled: true,
    gstNumber: '27AABCU9603R1ZM',
    cgstRate: 9,
    sgstRate: 9,
    igstRate: 18,
    taxIncludedInPrice: false,
  });

  const handleSaveGeneral = () => {
    alert('General settings saved successfully!');
  };

  const handleSavePayment = () => {
    alert('Payment settings saved successfully!');
  };

  const handleSaveEmail = () => {
    alert('Email settings saved successfully!');
  };

  const handleSaveSecurity = () => {
    alert('Security settings saved successfully!');
  };

  const handleSaveShipping = () => {
    alert('Shipping settings saved successfully!');
  };

  const handleSaveTax = () => {
    alert('Tax settings saved successfully!');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'payment', label: 'Payment', icon: '💳' },
    { id: 'email', label: 'Email', icon: '📧' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'shipping', label: 'Shipping', icon: '🚚' },
    { id: 'tax', label: 'Tax', icon: '📊' },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-2">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">General Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
              <input
                type="text"
                value={generalSettings.siteName}
                onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site Tagline</label>
              <input
                type="text"
                value={generalSettings.siteTagline}
                onChange={(e) => setGeneralSettings({ ...generalSettings, siteTagline: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
              <input
                type="email"
                value={generalSettings.contactEmail}
                onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
              <input
                type="tel"
                value={generalSettings.contactPhone}
                onChange={(e) => setGeneralSettings({ ...generalSettings, contactPhone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={generalSettings.address}
                onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              <select
                value={generalSettings.timezone}
                onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                value={generalSettings.currency}
                onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
              <select
                value={generalSettings.dateFormat}
                onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
              <select
                value={generalSettings.timeFormat}
                onChange={(e) => setGeneralSettings({ ...generalSettings, timeFormat: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="12h">12 Hour</option>
                <option value="24h">24 Hour</option>
              </select>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveGeneral}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Save General Settings
            </button>
          </div>
        </div>
      )}

      {/* Payment Settings */}
      {activeTab === 'payment' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Settings</h3>
          
          {/* Razorpay */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Razorpay</h4>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentSettings.razorpayEnabled}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, razorpayEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
            {paymentSettings.razorpayEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Key ID</label>
                  <input
                    type="text"
                    value={paymentSettings.razorpayKeyId}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, razorpayKeyId: e.target.value })}
                    placeholder="rzp_test_xxxxx"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Key Secret</label>
                  <input
                    type="password"
                    value={paymentSettings.razorpayKeySecret}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, razorpayKeySecret: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Platform Commission & Tax */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platform Commission (%)</label>
              <input
                type="number"
                value={paymentSettings.platformCommission}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, platformCommission: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GST Percentage (%)</label>
              <input
                type="number"
                value={paymentSettings.gstPercentage}
                onChange={(e) => setPaymentSettings({ ...paymentSettings, gstPercentage: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSavePayment}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Save Payment Settings
            </button>
          </div>
        </div>
      )}

      {/* Email Settings */}
      {activeTab === 'email' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Email Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
              <input
                type="text"
                value={emailSettings.smtpHost}
                onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
              <input
                type="number"
                value={emailSettings.smtpPort}
                onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
              <input
                type="text"
                value={emailSettings.smtpUsername}
                onChange={(e) => setEmailSettings({ ...emailSettings, smtpUsername: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
              <input
                type="password"
                value={emailSettings.smtpPassword}
                onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
              <input
                type="email"
                value={emailSettings.fromEmail}
                onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
              <input
                type="text"
                value={emailSettings.fromName}
                onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={emailSettings.orderConfirmationEnabled}
                  onChange={(e) => setEmailSettings({ ...emailSettings, orderConfirmationEnabled: e.target.checked })}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="ml-3 text-gray-700">Order Confirmation Email</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={emailSettings.orderShippedEnabled}
                  onChange={(e) => setEmailSettings({ ...emailSettings, orderShippedEnabled: e.target.checked })}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="ml-3 text-gray-700">Order Shipped Email</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={emailSettings.orderDeliveredEnabled}
                  onChange={(e) => setEmailSettings({ ...emailSettings, orderDeliveredEnabled: e.target.checked })}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="ml-3 text-gray-700">Order Delivered Email</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={emailSettings.vendorApprovalEnabled}
                  onChange={(e) => setEmailSettings({ ...emailSettings, vendorApprovalEnabled: e.target.checked })}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="ml-3 text-gray-700">Vendor Approval Email</span>
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveEmail}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Save Email Settings
            </button>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Security Settings</h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600">Require 2FA for admin login</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={securitySettings.twoFactorEnabled}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password Min Length</label>
                <input
                  type="number"
                  value={securitySettings.passwordMinLength}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Password Requirements</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={securitySettings.passwordRequireUppercase}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, passwordRequireUppercase: e.target.checked })}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="ml-3 text-gray-700">Require Uppercase Letters</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={securitySettings.passwordRequireLowercase}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, passwordRequireLowercase: e.target.checked })}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="ml-3 text-gray-700">Require Lowercase Letters</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={securitySettings.passwordRequireNumbers}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, passwordRequireNumbers: e.target.checked })}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="ml-3 text-gray-700">Require Numbers</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={securitySettings.passwordRequireSpecialChars}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, passwordRequireSpecialChars: e.target.checked })}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="ml-3 text-gray-700">Require Special Characters</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveSecurity}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Save Security Settings
            </button>
          </div>
        </div>
      )}

      {/* Shipping & Tax Settings - Simplified versions */}
      {activeTab === 'shipping' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Shipping Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Free Shipping Threshold (₹)</label>
              <input
                type="number"
                value={shippingSettings.freeShippingThreshold}
                onChange={(e) => setShippingSettings({ ...shippingSettings, freeShippingThreshold: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Default Shipping Charge (₹)</label>
              <input
                type="number"
                value={shippingSettings.defaultShippingCharge}
                onChange={(e) => setShippingSettings({ ...shippingSettings, defaultShippingCharge: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveShipping}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Save Shipping Settings
            </button>
          </div>
        </div>
      )}

      {activeTab === 'tax' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Tax Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
              <input
                type="text"
                value={taxSettings.gstNumber}
                onChange={(e) => setTaxSettings({ ...taxSettings, gstNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CGST Rate (%)</label>
              <input
                type="number"
                value={taxSettings.cgstRate}
                onChange={(e) => setTaxSettings({ ...taxSettings, cgstRate: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveTax}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Save Tax Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

