'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface TDSSummary {
  total_tds_deducted: number;
  avg_tds_rate: number;
  total_vendors: number;
  total_payouts: number;
  total_sales_value: number;
  total_net_payouts: number;
}

interface TDSRecord {
  id: number;
  payout_number: string;
  vendor: {
    id: number;
    business_name: string;
    email: string;
    pan_number: string;
  };
  period_start: string;
  period_end: string;
  total_sales: number;
  tds_rate: number;
  tds_amount: number;
  net_amount: number;
  status: string;
  created_at: string;
}

interface MonthlyTrend {
  month: string;
  tds_amount: number;
  payout_count: number;
  vendor_count: number;
}

interface TopVendor {
  vendor_id: number;
  vendor: {
    business_name: string;
    email: string;
    pan_number: string;
  };
  total_tds: number;
  total_sales: number;
  total_payouts: number;
  payout_count: number;
}

interface TDSByRate {
  tds_rate: number;
  total_tds: number;
  payout_count: number;
  vendor_count: number;
}

export default function TDSManagement() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'records' | 'certificates'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('month');
  const [financialYear, setFinancialYear] = useState('2025-2026');

  // Dashboard data
  const [summary, setSummary] = useState<TDSSummary | null>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);
  const [topVendors, setTopVendors] = useState<TopVendor[]>([]);
  const [tdsByRate, setTdsByRate] = useState<TDSByRate[]>([]);
  const [recentDeductions, setRecentDeductions] = useState<TDSRecord[]>([]);

  // Records data
  const [records, setRecords] = useState<TDSRecord[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [filters, setFilters] = useState({
    vendor_id: '',
    financial_year: '2025-2026',
    start_date: '',
    end_date: '',
    tds_rate: '',
    status: '',
    search: '',
  });

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboard();
    } else if (activeTab === 'records') {
      fetchRecords();
    }
  }, [activeTab, period, financialYear]);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await api.get('/v1/admin/tds/dashboard', {
        params: { period, financial_year: financialYear }
      });
      setSummary(response.data.summary);
      setMonthlyTrend(response.data.monthly_trend || []);
      setTopVendors(response.data.top_vendors || []);
      setTdsByRate(response.data.tds_by_rate || []);
      setRecentDeductions(response.data.recent_deductions || []);
    } catch (error) {
      console.error('Error fetching TDS dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get('/v1/admin/tds', {
        params: { page, ...filters }
      });
      setRecords(response.data.data || []);
      setPagination(response.data);
    } catch (error) {
      console.error('Error fetching TDS records:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (payoutId: number, payoutNumber: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/admin/tds/certificate/${payoutId}/download`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/pdf',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download certificate');
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TDS_Certificate_${payoutNumber}.pdf`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('TDS Certificate downloaded successfully!');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Failed to download certificate. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-4 items-center">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Financial Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Financial Year</label>
          <select
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="2025-2026">FY 2025-26</option>
            <option value="2024-2025">FY 2024-25</option>
            <option value="2023-2024">FY 2023-24</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Total TDS Deducted</p>
                <p className="text-3xl font-bold mt-2">{formatCurrency(summary.total_tds_deducted)}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">Average TDS Rate</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{summary.avg_tds_rate.toFixed(2)}%</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">Total Vendors</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{summary.total_vendors}</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <p className="text-gray-600 text-sm font-medium">Total Payouts</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{summary.total_payouts}</p>
          </div>
        </div>
      )}

      {/* TDS by Rate Breakdown */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">TDS by Rate</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">TDS Rate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total TDS</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payouts</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tdsByRate.map((rate, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{rate.tds_rate}%</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(rate.total_tds)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{rate.payout_count}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{rate.vendor_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Vendors by TDS */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Vendors by TDS Deducted</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PAN</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total TDS</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sales</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payouts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topVendors.map((vendor) => (
                <tr key={vendor.vendor_id}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{vendor.vendor.business_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{vendor.vendor.pan_number}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-red-600">{formatCurrency(vendor.total_tds)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(vendor.total_sales)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{vendor.payout_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRecords = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Financial Year</label>
            <select
              value={filters.financial_year}
              onChange={(e) => setFilters({ ...filters, financial_year: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="2025-2026">FY 2025-26</option>
              <option value="2024-2025">FY 2024-25</option>
              <option value="2023-2024">FY 2023-24</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">TDS Rate</label>
            <select
              value={filters.tds_rate}
              onChange={(e) => setFilters({ ...filters, tds_rate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Rates</option>
              <option value="0.1">0.1%</option>
              <option value="1">1%</option>
              <option value="2">2%</option>
              <option value="5">5%</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Payout #, Vendor, PAN..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => fetchRecords()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Apply Filters
          </button>
          <button
            onClick={() => {
              setFilters({
                vendor_id: '',
                financial_year: '2025-2026',
                start_date: '',
                end_date: '',
                tds_rate: '',
                status: '',
                search: '',
              });
              fetchRecords();
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payout #</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PAN</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">TDS Rate</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">TDS Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-blue-600">{record.payout_number}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{record.vendor.business_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{record.vendor.pan_number}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(record.period_start)} - {formatDate(record.period_end)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(record.total_sales)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{record.tds_rate}%</td>
                  <td className="px-4 py-3 text-sm font-semibold text-red-600">{formatCurrency(record.tds_amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => downloadCertificate(record.id, record.payout_number)}
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">TDS Management</h1>
        <p className="text-gray-600 mt-1">Track and manage Tax Deducted at Source (Section 194-O)</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'records'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            TDS Records
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'certificates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Certificates
          </button>
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'records' && renderRecords()}
          {activeTab === 'certificates' && (
            <div className="bg-white rounded-xl p-8 shadow-md border border-gray-200">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">TDS Certificates Ready!</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  You can now download TDS certificates for all payouts with TDS deductions.
                  Go to the "TDS Records" tab and click the "Download" button next to any record.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-600 text-white p-2 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Professional Format</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Certificates are generated in professional PDF format with all required details as per Section 194-O.
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-green-600 text-white p-2 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Compliance Ready</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    All certificates include deductor/deductee details, TAN, PAN, and comply with Income Tax regulations.
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-purple-600 text-white p-2 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Instant Download</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Download certificates instantly as PDF files. No waiting, no manual processing required.
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-2">How to Download Certificates:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-800">
                      <li>Go to the "TDS Records" tab</li>
                      <li>Find the payout record you need a certificate for</li>
                      <li>Click the "Download" button in the Actions column</li>
                      <li>The PDF certificate will be downloaded to your device</li>
                      <li>You can share this certificate with vendors for their tax filing</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => setActiveTab('records')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Go to TDS Records
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

