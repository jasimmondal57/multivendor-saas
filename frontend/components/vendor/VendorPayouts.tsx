'use client';

import { useState } from 'react';

export default function VendorPayouts() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payouts & Earnings</h1>
        <p className="text-gray-600">Track your earnings and payout history</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="text-sm mb-2">Total Earnings</div>
          <div className="text-3xl font-bold">₹0</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="text-sm mb-2">Pending Payout</div>
          <div className="text-3xl font-bold">₹0</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="text-sm mb-2">This Month</div>
          <div className="text-3xl font-bold">₹0</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="text-sm mb-2">Last Payout</div>
          <div className="text-3xl font-bold">₹0</div>
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-white rounded-xl shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Payout History</h2>
        </div>
        <div className="p-12 text-center text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p>No payout history available</p>
          <p className="text-sm mt-2">Your payouts will appear here once processed</p>
        </div>
      </div>
    </div>
  );
}

