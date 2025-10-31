'use client';

import { useState, useEffect } from 'react';
import { whatsappTemplateService, type WhatsAppTemplate, adminService } from '@/lib/admin';

export default function WhatsAppSettings() {
  const [activeTab, setActiveTab] = useState('setup');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showMetaSubmit, setShowMetaSubmit] = useState(false);
  const [metaTemplateName, setMetaTemplateName] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [testVariables, setTestVariables] = useState<string[]>([]);
  const [webhookInfo, setWebhookInfo] = useState<any>(null);
  const [generatingToken, setGeneratingToken] = useState(false);

  useEffect(() => {
    fetchSettings();
    if (activeTab === 'templates') {
      fetchTemplates();
    }
    if (activeTab === 'setup') {
      fetchWebhookInfo();
    }
  }, [activeTab, selectedCategory]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await adminService.getSettings('whatsapp');
      if (response.success) {
        setSettings(response.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWebhookInfo = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/admin/whatsapp/webhook-info`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setWebhookInfo(data.data);
      }
    } catch (error) {
      console.error('Error fetching webhook info:', error);
    }
  };

  const generateVerifyToken = async () => {
    setGeneratingToken(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/admin/whatsapp/generate-verify-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.success) {
        alert('Verify token generated successfully!');
        await fetchWebhookInfo();
        await fetchSettings();
      }
    } catch (error) {
      console.error('Error generating token:', error);
      alert('Failed to generate verify token');
    } finally {
      setGeneratingToken(false);
    }
  };

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await whatsappTemplateService.getTemplates(selectedCategory);
      if (response.success) {
        // Parse variables JSON string to array
        const parsedTemplates = response.data.map((template: any) => ({
          ...template,
          variables: typeof template.variables === 'string'
            ? JSON.parse(template.variables)
            : template.variables,
          buttons: typeof template.buttons === 'string'
            ? JSON.parse(template.buttons)
            : template.buttons
        }));
        setTemplates(parsedTemplates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const response = await adminService.updateSettings('whatsapp', settings);
      if (response.success) {
        alert('WhatsApp settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmitToMeta = async () => {
    if (!selectedTemplate || !metaTemplateName) return;

    try {
      const response = await whatsappTemplateService.submitToMeta(selectedTemplate.id, metaTemplateName);
      if (response.success) {
        alert('Template submitted to Meta for approval!');
        setShowMetaSubmit(false);
        fetchTemplates();
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to submit template');
    }
  };

  const handleCheckStatus = async (template: WhatsAppTemplate) => {
    try {
      const response = await whatsappTemplateService.checkMetaStatus(template.id);
      if (response.success) {
        alert(`Template Status: ${response.data.status}`);
        fetchTemplates();
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to check status');
    }
  };

  const handleTestSend = async () => {
    if (!selectedTemplate || !testPhone) return;

    try {
      const response = await whatsappTemplateService.testSend(testPhone, selectedTemplate.code, testVariables);
      if (response.success) {
        alert('Test message sent successfully!');
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to send test message');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      pending_approval: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryBadge = (category: string) => {
    const badges = {
      otp: 'bg-purple-100 text-purple-800',
      customer: 'bg-blue-100 text-blue-800',
      vendor: 'bg-indigo-100 text-indigo-800',
      admin: 'bg-pink-100 text-pink-800',
    };
    return badges[category as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">WhatsApp Integration</h2>
          <p className="text-gray-600 mt-1">Configure WhatsApp notifications and manage templates</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'setup', label: 'Setup & Configuration', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
            { id: 'templates', label: 'Templates', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
            { id: 'logs', label: 'Message Logs', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
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

      {/* Setup & Configuration Tab */}
      {activeTab === 'setup' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="space-y-6">
            {/* General Settings */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                General Settings
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enable WhatsApp Notifications (Master Switch)
                    </label>
                    <select
                      value={settings.whatsapp_enabled || '1'}
                      onChange={(e) => updateSetting('whatsapp_enabled', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1">Enabled</option>
                      <option value="0">Disabled</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      This is a global switch. Disable to turn off ALL WhatsApp notifications.
                    </p>
                  </div>
                </div>

                {/* Info Box for Event Triggers */}
                <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-blue-900 mb-1">
                        💡 Control WhatsApp for Specific Events
                      </h4>
                      <p className="text-xs text-blue-800 mb-2">
                        To enable/disable WhatsApp for specific events (Order Placed, Product Approved, etc.), go to the <strong>Event Triggers</strong> tab in System Settings.
                      </p>
                      <p className="text-xs text-blue-700">
                        <strong>This tab</strong> = API configuration & templates<br/>
                        <strong>Event Triggers tab</strong> = Control which events send WhatsApp
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Meta WhatsApp Cloud API Configuration */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Meta WhatsApp Cloud API Configuration
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">How to get these credentials:</p>
                    <ol className="list-decimal list-inside space-y-1 text-blue-700">
                      <li>Go to <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="underline">Meta for Developers</a></li>
                      <li>Create a WhatsApp Business App</li>
                      <li>Get your Phone Number ID from the WhatsApp section</li>
                      <li>Get your WABA ID from Business Settings</li>
                      <li>Generate a permanent Access Token</li>
                    </ol>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={settings.whatsapp_phone_number_id || ''}
                    onChange={(e) => updateSetting('whatsapp_phone_number_id', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Phone Number ID"
                  />
                  <p className="text-xs text-gray-500 mt-1">From Meta WhatsApp Business API</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Business Account ID (WABA ID) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={settings.whatsapp_waba_id || ''}
                    onChange={(e) => updateSetting('whatsapp_waba_id', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter WABA ID"
                  />
                  <p className="text-xs text-gray-500 mt-1">For template submission and management</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Access Token (Permanent) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={settings.whatsapp_access_token || ''}
                    onChange={(e) => updateSetting('whatsapp_access_token', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter Meta Access Token"
                  />
                  <p className="text-xs text-gray-500 mt-1">Generate a permanent token from Meta Business Settings</p>
                </div>
              </div>
            </div>

            {/* Webhook Configuration */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Webhook Configuration
              </h3>

              {webhookInfo ? (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Webhook URL (Callback URL)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={webhookInfo.webhook_url}
                          readOnly
                          className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg font-mono text-sm"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(webhookInfo.webhook_url);
                            alert('Copied to clipboard!');
                          }}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Verify Token
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={webhookInfo.verify_token || 'Not generated yet'}
                          readOnly
                          className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg font-mono text-sm"
                        />
                        <button
                          onClick={() => {
                            if (webhookInfo.verify_token) {
                              navigator.clipboard.writeText(webhookInfo.verify_token);
                              alert('Copied to clipboard!');
                            }
                          }}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          disabled={!webhookInfo.verify_token}
                        >
                          Copy
                        </button>
                        <button
                          onClick={generateVerifyToken}
                          disabled={generatingToken}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {generatingToken ? 'Generating...' : 'Generate New'}
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-indigo-200">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Setup Instructions
                      </h4>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                        {webhookInfo.instructions?.map((instruction: string, index: number) => (
                          <li key={index}>{instruction}</li>
                        ))}
                      </ol>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium mb-1">Important Notes:</p>
                          <ul className="list-disc list-inside space-y-1">
                            <li>Subscribe to webhook fields: <strong>messages</strong> and <strong>message_status</strong></li>
                            <li>Make sure your server is publicly accessible (not localhost)</li>
                            <li>Use HTTPS in production for security</li>
                            <li>Keep your verify token secure and don't share it publicly</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading webhook information...</p>
                </div>
              )}
            </div>

            {/* Notification Preferences - Moved to Event Triggers Tab */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Notification Preferences Moved
              </h3>
              <div className="border border-blue-200 bg-blue-50 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-blue-900 mb-2">WhatsApp Notification Settings Moved</h4>
                    <p className="text-sm text-blue-800 mb-3">
                      WhatsApp notification preferences for all events (OTP, Order Notifications, Vendor Notifications, etc.) are now managed in the <strong>Event Triggers</strong> tab.
                    </p>
                    <div className="bg-white border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-blue-900 font-medium mb-2">What you can do in Event Triggers:</p>
                      <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                        <li>Enable/Disable WhatsApp for <strong>each specific event</strong> (50 events total)</li>
                        <li>Choose which WhatsApp template to use for each event</li>
                        <li>Control OTP, Order, Vendor, and all other notifications individually</li>
                        <li>See all events in one organized place</li>
                      </ul>
                    </div>
                    <button
                      onClick={() => {
                        // Navigate to Event Triggers tab
                        const settingsTabSetter = (window as any).__setSettingsTab;
                        if (settingsTabSetter) {
                          settingsTabSetter('event-triggers');
                        }
                      }}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                    >
                      Go to Event Triggers →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">WhatsApp Templates</h3>
                <p className="text-gray-600 mt-1">Manage WhatsApp message templates and Meta approval</p>
              </div>
              <button
                onClick={() => {
                  setSelectedTemplate(null);
                  setShowEditor(true);
                }}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                + Create Template
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {['all', 'otp', 'customer', 'vendor', 'admin'].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Templates List */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-600">{template.code}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryBadge(template.category)}`}>
                    {template.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(template.status)}`}>
                    {template.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-700 line-clamp-3">{template.body}</p>
              </div>

              {template.variables && Array.isArray(template.variables) && template.variables.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Variables:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.map((variable, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {`{{${index + 1}}}`} {variable}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                {template.status === 'draft' && (
                  <button
                    onClick={() => {
                      setSelectedTemplate(template);
                      setMetaTemplateName(template.code);
                      setShowMetaSubmit(true);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
                  >
                    Submit to Meta
                  </button>
                )}
                {template.status === 'pending_approval' && (
                  <button
                    onClick={() => handleCheckStatus(template)}
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-all"
                  >
                    Check Status
                  </button>
                )}
                {template.status === 'approved' && (
                  <button
                    onClick={() => {
                      setSelectedTemplate(template);
                      setTestVariables(Array.isArray(template.variables) ? template.variables : []);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all"
                  >
                    Test Send
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedTemplate(template);
                    setShowEditor(true);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all"
                >
                  Edit
                </button>
              </div>
            </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900">WhatsApp Message Logs</h3>
            <p className="text-gray-600 mt-1">View all WhatsApp messages sent from the system</p>
          </div>
          <div className="text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium">Message logs will appear here</p>
            <p className="text-sm mt-2">Send some WhatsApp messages to see the logs</p>
          </div>
        </div>
      )}

      {/* Meta Submit Modal */}
      {showMetaSubmit && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Submit to Meta</h3>
            <p className="text-gray-600 mb-6">Enter the template name for Meta approval:</p>
            <input
              type="text"
              value={metaTemplateName}
              onChange={(e) => setMetaTemplateName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-6"
              placeholder="Template name"
            />
            <div className="flex gap-4">
              <button
                onClick={handleSubmitToMeta}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Submit
              </button>
              <button
                onClick={() => setShowMetaSubmit(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Send Modal */}
      {selectedTemplate && testVariables.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Test Send</h3>
            <input
              type="text"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
              placeholder="Phone number (10 digits)"
            />
            {Array.isArray(selectedTemplate.variables) && selectedTemplate.variables.map((variable, index) => (
              <input
                key={index}
                type="text"
                value={testVariables[index] || ''}
                onChange={(e) => {
                  const newVars = [...testVariables];
                  newVars[index] = e.target.value;
                  setTestVariables(newVars);
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
                placeholder={`${variable} ({{${index + 1}}})`}
              />
            ))}
            <div className="flex gap-4">
              <button
                onClick={handleTestSend}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                Send
              </button>
              <button
                onClick={() => {
                  setSelectedTemplate(null);
                  setTestVariables([]);
                }}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

