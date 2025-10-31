'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface RevenueSummary {
  total_revenue: number;
  commission_revenue: number;
  subscription_revenue: number;
  listing_fee_revenue: number;
  advertisement_revenue: number;
  penalty_revenue: number;
  total_orders_value: number;
  total_payouts: number;
  avg_commission_rate: number;
  period: string;
}

interface RevenueRecord {
  id: number;
  revenue_number: string;
  source_type: string;
  vendor_name: string | null;
  order_number: string | null;
  gross_amount: number;
  commission_amount: number;
  gst_amount: number;
  net_revenue: number;
  revenue_date: string;
  status: string;
  description: string | null;
}

interface TopVendor {
  vendor_id: number;
  vendor_name: string;
  total_commission: number;
  transaction_count: number;
}

interface TopSource {
  source_type: string;
  total: number;
}

export default function RevenueManagement() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'analytics'>('dashboard');
  const [period, setPeriod] = useState('month');
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
  const [topSources, setTopSources] = useState<TopSource[]>([]);
  const [topVendors, setTopVendors] = useState<TopVendor[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RevenueRecord[]>([]);
  const [transactions, setTransactions] = useState<RevenueRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filters, setFilters] = useState({
    source_type: 'all',
    status: 'all',
    start_date: '',
    end_date: '',
    search: '',
  });

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboard();
    } else if (activeTab === 'transactions') {
      fetchTransactions();
    }
  }, [activeTab, period, filters]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/v1/admin/revenue/dashboard?period=${period}`);
      if (response.data.success) {
        setSummary(response.data.data.summary);
        setRevenueTrend(response.data.data.revenue_trend);
        setTopSources(response.data.data.top_sources);
        setTopVendors(response.data.data.top_vendors);
        setRecentTransactions(response.data.data.recent_transactions);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params: any = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') params[key] = value;
      });

      const response = await api.get('/v1/admin/revenue', { params });
      if (response.data.success) {
        setTransactions(response.data.data.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSourceTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      commission: 'bg-blue-100 text-blue-800',
      subscription: 'bg-purple-100 text-purple-800',
      listing_fee: 'bg-green-100 text-green-800',
      advertisement: 'bg-yellow-100 text-yellow-800',
      penalty: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors.other;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      refunded: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Revenue Management
          </h2>
          <p className="text-sm text-gray-600 mt-1">Track platform revenue, commissions, and earnings</p>
        </div>
        
        {/* Period Selector */}
        {activeTab === 'dashboard' && (
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'dashboard'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Dashboard
            </div>
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'transactions'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Transactions
            </div>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'analytics'
                ? 'border-green-600 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Analytics
            </div>
          </button>
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Revenue */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">Total Revenue</h3>
                  <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold">{formatCurrency(summary.total_revenue)}</p>
                <p className="text-xs opacity-80 mt-2">Period: {summary.period}</p>
              </div>

              {/* Commission Revenue */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Commission Revenue</h3>
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.commission_revenue)}</p>
                <p className="text-xs text-gray-500 mt-2">Avg Rate: {summary.avg_commission_rate}%</p>
              </div>

              {/* Total Orders Value */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Total Orders Value</h3>
                  <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.total_orders_value)}</p>
                <p className="text-xs text-gray-500 mt-2">Gross merchandise value</p>
              </div>

              {/* Total Payouts */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Total Payouts</h3>
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.total_payouts)}</p>
                <p className="text-xs text-gray-500 mt-2">Paid to vendors</p>
              </div>
            </div>
          )}

          {/* Revenue Breakdown */}
          {summary && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Sources */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Source</h3>
                <div className="space-y-3">
                  {topSources.map((source) => (
                    <div key={source.source_type} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSourceTypeColor(source.source_type)}`}>
                          {source.source_type.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <span className="font-semibold text-gray-900">{formatCurrency(parseFloat(source.total.toString()))}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Vendors */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Vendors by Commission</h3>
                <div className="space-y-3">
                  {topVendors.slice(0, 5).map((vendor, index) => (
                    <div key={vendor.vendor_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-800 text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{vendor.vendor_name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(parseFloat(vendor.total_commission.toString()))}</p>
                        <p className="text-xs text-gray-500">{vendor.transaction_count} transactions</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.revenue_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceTypeColor(transaction.source_type)}`}>
                          {transaction.source_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.vendor_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.revenue_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                        {formatCurrency(transaction.net_revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source Type</label>
                <select
                  value={filters.source_type}
                  onChange={(e) => setFilters({ ...filters, source_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Sources</option>
                  <option value="commission">Commission</option>
                  <option value="subscription">Subscription</option>
                  <option value="listing_fee">Listing Fee</option>
                  <option value="advertisement">Advertisement</option>
                  <option value="penalty">Penalty</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Gross</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">GST</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Revenue</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.revenue_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSourceTypeColor(transaction.source_type)}`}>
                          {transaction.source_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {transaction.vendor_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.order_number || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.revenue_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(transaction.gross_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(transaction.commission_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(transaction.gst_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 text-right">
                        {formatCurrency(transaction.net_revenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
            <p className="text-gray-600">Detailed analytics and charts coming soon...</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading...</p>
          </div>
        </div>
      )}
    </div>
  );
}

