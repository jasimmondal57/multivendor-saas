'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/lib/admin';
import EmailTemplates from './EmailTemplates';
import WhatsAppSettings from './WhatsAppSettings';
import EventTriggers from './EventTriggers';

interface SystemSettingsProps {
  activeTab: string;
}

export default function SystemSettings({ activeTab }: SystemSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settingsTab, setSettingsTab] = useState('general');
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetchSettings();
    // Expose setSettingsTab to child components for navigation
    (window as any).__setSettingsTab = setSettingsTab;
    return () => {
      delete (window as any).__setSettingsTab;
    };
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await adminService.getSettings('all');
      if (response.success) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (group: string) => {
    setSaving(true);
    try {
      const response = await adminService.updateSettings(group, settings[group] || {});
      if (response.success) {
        alert('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (group: string, key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: value,
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Settings Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-2">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'general', label: 'General', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
            { id: 'payment', label: 'Payment', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
            { id: 'email', label: 'Email', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
            { id: 'email-templates', label: 'Email Templates', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
            { id: 'event-triggers', label: 'Event Triggers', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { id: 'whatsapp', label: 'WhatsApp', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
            { id: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
            { id: 'shipping', label: 'Shipping', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSettingsTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                settingsTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* General Settings */}
      {settingsTab === 'general' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">General Settings</h3>
              <p className="text-sm text-gray-600 mt-1">Configure basic site information and preferences</p>
            </div>
            <button
              onClick={() => handleSave('general')}
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
              <input
                type="text"
                value={settings.general?.site_name || ''}
                onChange={(e) => updateSetting('general', 'site_name', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site Tagline</label>
              <input
                type="text"
                value={settings.general?.site_tagline || ''}
                onChange={(e) => updateSetting('general', 'site_tagline', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
              <input
                type="email"
                value={settings.general?.contact_email || ''}
                onChange={(e) => updateSetting('general', 'contact_email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
              <input
                type="text"
                value={settings.general?.contact_phone || ''}
                onChange={(e) => updateSetting('general', 'contact_phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
              <textarea
                value={settings.general?.address || ''}
                onChange={(e) => updateSetting('general', 'address', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              <select
                value={settings.general?.timezone || 'Asia/Kolkata'}
                onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
              <select
                value={settings.general?.currency || 'INR'}
                onChange={(e) => updateSetting('general', 'currency', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                value={settings.general?.date_format || 'DD/MM/YYYY'}
                onChange={(e) => updateSetting('general', 'date_format', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Format</label>
              <select
                value={settings.general?.time_format || '12h'}
                onChange={(e) => updateSetting('general', 'time_format', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="12h">12 Hour</option>
                <option value="24h">24 Hour</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Payment Settings */}
      {settingsTab === 'payment' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Payment Settings</h3>
              <p className="text-sm text-gray-600 mt-1">Configure payment gateways and commission rates</p>
            </div>
            <button
              onClick={() => handleSave('payment')}
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="space-y-8">
            {/* Razorpay */}
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Razorpay</h4>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.payment?.razorpay_enabled || false}
                    onChange={(e) => updateSetting('payment', 'razorpay_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Key ID</label>
                  <input
                    type="text"
                    value={settings.payment?.razorpay_key_id || ''}
                    onChange={(e) => updateSetting('payment', 'razorpay_key_id', e.target.value)}
                    placeholder="rzp_test_xxxxx"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Key Secret</label>
                  <input
                    type="password"
                    value={settings.payment?.razorpay_key_secret || ''}
                    onChange={(e) => updateSetting('payment', 'razorpay_key_secret', e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Stripe */}
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Stripe</h4>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.payment?.stripe_enabled || false}
                    onChange={(e) => updateSetting('payment', 'stripe_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Publishable Key</label>
                  <input
                    type="text"
                    value={settings.payment?.stripe_publishable_key || ''}
                    onChange={(e) => updateSetting('payment', 'stripe_publishable_key', e.target.value)}
                    placeholder="pk_test_xxxxx"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
                  <input
                    type="password"
                    value={settings.payment?.stripe_secret_key || ''}
                    onChange={(e) => updateSetting('payment', 'stripe_secret_key', e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* COD */}
            <div className="border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Cash on Delivery (COD)</h4>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.payment?.cod_enabled || false}
                    onChange={(e) => updateSetting('payment', 'cod_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum COD Amount (₹)</label>
                <input
                  type="number"
                  value={settings.payment?.cod_max_amount || 50000}
                  onChange={(e) => updateSetting('payment', 'cod_max_amount', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Commission & Tax */}
            <div className="border border-gray-200 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Commission & Tax</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platform Commission (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.payment?.platform_commission || 10}
                    onChange={(e) => updateSetting('payment', 'platform_commission', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Commission charged on vendor sales (excluding GST)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GST on Commission (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.payment?.commission_gst_percentage || 18}
                    onChange={(e) => updateSetting('payment', 'commission_gst_percentage', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">GST charged on platform commission</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Product GST rates are set individually during product creation based on HSN code. Common rates: 0%, 5%, 12%, 18%, 28%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Settings */}
      {settingsTab === 'email' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Email Settings</h3>
              <p className="text-sm text-gray-600 mt-1">Configure SMTP and email notifications</p>
            </div>
            <button
              onClick={() => handleSave('email')}
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="space-y-8">
            {/* SMTP Configuration */}
            <div className="border border-gray-200 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">SMTP Configuration</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Host</label>
                  <input
                    type="text"
                    value={settings.email?.smtp_host || ''}
                    onChange={(e) => updateSetting('email', 'smtp_host', e.target.value)}
                    placeholder="smtp.gmail.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Port</label>
                  <input
                    type="number"
                    value={settings.email?.smtp_port || 587}
                    onChange={(e) => updateSetting('email', 'smtp_port', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Username</label>
                  <input
                    type="text"
                    value={settings.email?.smtp_username || ''}
                    onChange={(e) => updateSetting('email', 'smtp_username', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SMTP Password</label>
                  <input
                    type="password"
                    value={settings.email?.smtp_password || ''}
                    onChange={(e) => updateSetting('email', 'smtp_password', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Encryption</label>
                  <select
                    value={settings.email?.smtp_encryption || 'tls'}
                    onChange={(e) => updateSetting('email', 'smtp_encryption', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="tls">TLS</option>
                    <option value="ssl">SSL</option>
                  </select>
                </div>
              </div>
            </div>

            {/* From Address */}
            <div className="border border-gray-200 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">From Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                  <input
                    type="email"
                    value={settings.email?.from_email || ''}
                    onChange={(e) => updateSetting('email', 'from_email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
                  <input
                    type="text"
                    value={settings.email?.from_name || ''}
                    onChange={(e) => updateSetting('email', 'from_name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Email Notifications - Moved to Event Triggers Tab */}
            <div className="border border-blue-200 bg-blue-50 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-lg font-semibold text-blue-900 mb-2">Email Notification Settings Moved</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    Email notification preferences for all events (Order Confirmation, Order Shipped, etc.) are now managed in the <strong>Event Triggers</strong> tab.
                  </p>
                  <button
                    onClick={() => setSettingsTab('event-triggers')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
                  >
                    Go to Event Triggers →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {settingsTab === 'security' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Security Settings</h3>
              <p className="text-sm text-gray-600 mt-1">Configure security and authentication policies</p>
            </div>
            <button
              onClick={() => handleSave('security')}
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={settings.security?.session_timeout || 30}
                  onChange={(e) => updateSetting('security', 'session_timeout', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Password Length</label>
                <input
                  type="number"
                  value={settings.security?.password_min_length || 8}
                  onChange={(e) => updateSetting('security', 'password_min_length', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                <input
                  type="number"
                  value={settings.security?.max_login_attempts || 5}
                  onChange={(e) => updateSetting('security', 'max_login_attempts', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lockout Duration (minutes)</label>
                <input
                  type="number"
                  value={settings.security?.lockout_duration || 15}
                  onChange={(e) => updateSetting('security', 'lockout_duration', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Password Requirements</h4>
              <div className="space-y-3">
                {[
                  { key: 'password_require_uppercase', label: 'Require Uppercase Letters' },
                  { key: 'password_require_lowercase', label: 'Require Lowercase Letters' },
                  { key: 'password_require_numbers', label: 'Require Numbers' },
                  { key: 'password_require_special_chars', label: 'Require Special Characters' },
                  { key: 'two_factor_enabled', label: 'Enable Two-Factor Authentication' },
                ].map((item) => (
                  <label key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={settings.security?.[item.key] || false}
                      onChange={(e) => updateSetting('security', item.key, e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Settings */}
      {settingsTab === 'shipping' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Shipping Settings</h3>
              <p className="text-sm text-gray-600 mt-1">Configure shipping rates and policies</p>
            </div>
            <button
              onClick={() => handleSave('shipping')}
              disabled={saving}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          {/* Basic Shipping Settings */}
          <div className="border border-gray-200 rounded-xl p-6 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Shipping Rates & Policies
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Free Shipping Threshold (₹)</label>
                <input
                  type="number"
                  value={settings.shipping?.free_shipping_threshold || 500}
                  onChange={(e) => updateSetting('shipping', 'free_shipping_threshold', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Shipping Charge (₹)</label>
                <input
                  type="number"
                  value={settings.shipping?.default_shipping_charge || 50}
                  onChange={(e) => updateSetting('shipping', 'default_shipping_charge', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Express Shipping Charge (₹)</label>
                <input
                  type="number"
                  value={settings.shipping?.express_shipping_charge || 100}
                  onChange={(e) => updateSetting('shipping', 'express_shipping_charge', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Delivery Days</label>
                <input
                  type="number"
                  value={settings.shipping?.estimated_delivery_days || 7}
                  onChange={(e) => updateSetting('shipping', 'estimated_delivery_days', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {[
                { key: 'international_shipping_enabled', label: 'Enable International Shipping' },
                { key: 'tracking_enabled', label: 'Enable Order Tracking' },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={settings.shipping?.[item.key] || false}
                    onChange={(e) => updateSetting('shipping', item.key, e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Delhivery Courier Integration */}
          <div className="border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Delhivery Courier API
                </h4>
                <p className="text-xs text-gray-500 mt-1">Integrate with Delhivery for automated shipping and tracking</p>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.shipping?.delhivery_enabled || false}
                  onChange={(e) => updateSetting('shipping', 'delhivery_enabled', e.target.checked)}
                  className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Enable</span>
              </label>
            </div>

            {settings.shipping?.delhivery_enabled && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Token <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={settings.shipping?.delhivery_api_key || ''}
                      onChange={(e) => updateSetting('shipping', 'delhivery_api_key', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter Delhivery API Token"
                    />
                    <p className="text-xs text-gray-500 mt-1">Get from Delhivery Dashboard → API Settings</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={settings.shipping?.delhivery_client_name || ''}
                      onChange={(e) => updateSetting('shipping', 'delhivery_client_name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter Client Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warehouse Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={settings.shipping?.delhivery_warehouse_name || ''}
                      onChange={(e) => updateSetting('shipping', 'delhivery_warehouse_name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter Warehouse Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mode
                    </label>
                    <select
                      value={settings.shipping?.delhivery_mode || 'test'}
                      onChange={(e) => updateSetting('shipping', 'delhivery_mode', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="test">Test Mode</option>
                      <option value="production">Production Mode</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Webhook URL
                    </label>
                    <input
                      type="text"
                      value={settings.shipping?.delhivery_webhook_url || `${typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/webhooks/delhivery`}
                      readOnly
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Configure this in Delhivery Dashboard</p>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  {[
                    { key: 'delhivery_auto_create_shipment', label: 'Auto Create Shipment on Order Confirmation', desc: 'Automatically create shipment in Delhivery when order is confirmed' },
                    { key: 'delhivery_auto_schedule_pickup', label: 'Auto Schedule Pickup', desc: 'Automatically schedule pickup with Delhivery' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-start justify-between p-3 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100">
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700 block">{item.label}</span>
                        <span className="text-xs text-gray-500">{item.desc}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.shipping?.[item.key] || false}
                        onChange={(e) => updateSetting('shipping', item.key, e.target.checked)}
                        className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 mt-1"
                      />
                    </label>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-900">Delhivery API Documentation</p>
                      <ul className="text-xs text-blue-800 mt-2 space-y-1 list-disc list-inside">
                        <li>Get API credentials from Delhivery Dashboard → Settings → API</li>
                        <li>Test Mode uses staging API endpoint for testing</li>
                        <li>Production Mode uses live API endpoint for real shipments</li>
                        <li>Configure webhook URL in Delhivery Dashboard for tracking updates</li>
                        <li>Ensure your server is publicly accessible for webhooks</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Email Templates */}
      {settingsTab === 'email-templates' && (
        <EmailTemplates />
      )}

      {/* Event Triggers */}
      {settingsTab === 'event-triggers' && (
        <EventTriggers />
      )}

      {/* WhatsApp Settings */}
      {settingsTab === 'whatsapp' && (
        <WhatsAppSettings />
      )}
    </div>
  );
}

