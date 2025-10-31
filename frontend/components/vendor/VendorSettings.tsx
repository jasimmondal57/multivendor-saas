'use client';

import { useState } from 'react';

export default function VendorSettings() {
  const [activeTab, setActiveTab] = useState('profile');

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
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your phone"
                />
              </div>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'store' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Store Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter business name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Store Description</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your store"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter business address"
                />
              </div>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'bank' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Bank Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter account holder name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter account number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter IFSC code"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter bank name"
                />
              </div>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <div className="font-medium text-gray-900">Order Notifications</div>
                  <div className="text-sm text-gray-500">Get notified when you receive new orders</div>
                </div>
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <div className="font-medium text-gray-900">Email Notifications</div>
                  <div className="text-sm text-gray-500">Receive email updates about your store</div>
                </div>
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <div className="font-medium text-gray-900">WhatsApp Notifications</div>
                  <div className="text-sm text-gray-500">Get WhatsApp alerts for important updates</div>
                </div>
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium text-gray-900">Marketing Emails</div>
                  <div className="text-sm text-gray-500">Receive tips and promotional content</div>
                </div>
                <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
              </div>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

