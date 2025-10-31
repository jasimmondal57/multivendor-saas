'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Vendor {
  id: number;
  business_name: string;
  business_email: string;
  commission_percentage: number;
}

interface Payout {
  id: number;
  payout_number: string;
  vendor_id: number;
  vendor: Vendor;
  period_start: string;
  period_end: string;
  total_sales: string;
  platform_commission: string;
  commission_rate: string;
  commission_gst?: string;
  commission_gst_rate?: string;
  total_commission_with_gst?: string;
  tds_amount: string;
  tds_rate: string;
  adjustment_amount: string;
  net_amount: string;
  total_orders: number;
  status: string;
  payment_method: string | null;
  payment_reference: string | null;
  processed_at: string | null;
  completed_at: string | null;
  failed_at: string | null;
  failure_reason: string | null;
  created_at: string;
}

interface PayoutStats {
  total_payouts: number;
  pending_payouts: number;
  processing_payouts: number;
  completed_payouts: number;
  failed_payouts: number;
  total_amount_paid: string;
  pending_amount: string;
}

export default function VendorPayouts() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [stats, setStats] = useState<PayoutStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  
  // Create payout form
  const [createForm, setCreateForm] = useState({
    vendor_id: '',
    period_start: '',
    period_end: '',
    adjustment_amount: '0',
    adjustment_reason: '',
    admin_notes: '',
  });
  const [calculation, setCalculation] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetchPayouts();
    fetchStats();
    fetchVendors();
  }, [activeTab]);

  const fetchPayouts = async () => {
    try {
      const params: any = {};
      if (activeTab !== 'all') {
        params.status = activeTab;
      }
      
      const response = await api.get('/v1/admin/payouts', { params });
      if (response.data.success) {
        setPayouts(response.data.data.data);
      }
    } catch (error) {
      console.error('Error fetching payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/v1/admin/payouts/statistics');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await api.get('/v1/admin/vendors', { params: { status: 'active' } });
      if (response.data.success) {
        setVendors(response.data.data.data);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const calculatePayout = async () => {
    if (!createForm.vendor_id || !createForm.period_start || !createForm.period_end) {
      alert('Please fill in all required fields');
      return;
    }

    setCalculating(true);
    try {
      const response = await api.post('/v1/admin/payouts/calculate', {
        vendor_id: createForm.vendor_id,
        period_start: createForm.period_start,
        period_end: createForm.period_end,
      });

      if (response.data.success) {
        setCalculation(response.data.data);
      } else {
        alert(response.data.message || 'Failed to calculate payout');
        setCalculation(null);
      }
    } catch (error: any) {
      console.error('Error calculating payout:', error);
      alert(error.response?.data?.message || 'Failed to calculate payout');
      setCalculation(null);
    } finally {
      setCalculating(false);
    }
  };

  const createPayout = async () => {
    try {
      const response = await api.post('/v1/admin/payouts', createForm);
      if (response.data.success) {
        alert('Payout created successfully');
        setShowCreateModal(false);
        setCreateForm({
          vendor_id: '',
          period_start: '',
          period_end: '',
          adjustment_amount: '0',
          adjustment_reason: '',
          admin_notes: '',
        });
        setCalculation(null);
        fetchPayouts();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error creating payout:', error);
      alert(error.response?.data?.message || 'Failed to create payout');
    }
  };

  const processPayout = async (payoutId: number) => {
    if (!confirm('Are you sure you want to process this payout?')) return;

    try {
      const response = await api.post(`/v1/admin/payouts/${payoutId}/process`);
      if (response.data.success) {
        alert('Payout processing initiated');
        fetchPayouts();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error processing payout:', error);
      alert(error.response?.data?.message || 'Failed to process payout');
    }
  };

  const completePayout = async (payoutId: number) => {
    const paymentReference = prompt('Enter payment reference/UTR number:');
    if (!paymentReference) return;

    try {
      const response = await api.post(`/v1/admin/payouts/${payoutId}/complete`, {
        payment_method: 'bank_transfer',
        payment_reference: paymentReference,
      });

      if (response.data.success) {
        alert('Payout completed successfully');
        fetchPayouts();
        fetchStats();
        if (selectedPayout?.id === payoutId) {
          setShowDetailsModal(false);
        }
      }
    } catch (error: any) {
      console.error('Error completing payout:', error);
      alert(error.response?.data?.message || 'Failed to complete payout');
    }
  };

  const failPayout = async (payoutId: number) => {
    const reason = prompt('Enter failure reason:');
    if (!reason) return;

    try {
      const response = await api.post(`/v1/admin/payouts/${payoutId}/fail`, {
        failure_reason: reason,
      });

      if (response.data.success) {
        alert('Payout marked as failed');
        fetchPayouts();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error failing payout:', error);
      alert(error.response?.data?.message || 'Failed to update payout');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'all', label: 'All Payouts', count: stats?.total_payouts || 0 },
    { id: 'pending', label: 'Pending', count: stats?.pending_payouts || 0 },
    { id: 'processing', label: 'Processing', count: stats?.processing_payouts || 0 },
    { id: 'completed', label: 'Completed', count: stats?.completed_payouts || 0 },
    { id: 'failed', label: 'Failed', count: stats?.failed_payouts || 0 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payouts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-green-100 text-sm">Total Paid</div>
          </div>
          <div className="text-3xl font-bold mb-1">₹{parseFloat(stats?.total_amount_paid || '0').toLocaleString('en-IN')}</div>
          <div className="text-green-100 text-sm">{stats?.completed_payouts || 0} completed payouts</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-yellow-100 text-sm">Pending</div>
          </div>
          <div className="text-3xl font-bold mb-1">₹{parseFloat(stats?.pending_amount || '0').toLocaleString('en-IN')}</div>
          <div className="text-yellow-100 text-sm">{stats?.pending_payouts || 0} pending payouts</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="text-blue-100 text-sm">Total</div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats?.total_payouts || 0}</div>
          <div className="text-blue-100 text-sm">All payouts</div>
        </div>
      </div>

      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Vendor Payouts</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Payout
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Payouts Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payout #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No payouts found
                  </td>
                </tr>
              ) : (
                payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payout.payout_number}</div>
                      <div className="text-xs text-gray-500">{new Date(payout.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payout.vendor.business_name}</div>
                      <div className="text-xs text-gray-500">{payout.vendor.business_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(payout.period_start).toLocaleDateString()} - {new Date(payout.period_end).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{parseFloat(payout.total_sales).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      -₹{parseFloat(payout.platform_commission).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                      ₹{parseFloat(payout.net_amount).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payout.status)}`}>
                        {payout.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setSelectedPayout(payout);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </button>
                      {payout.status === 'pending' && (
                        <button
                          onClick={() => processPayout(payout.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Process
                        </button>
                      )}
                      {payout.status === 'processing' && (
                        <>
                          <button
                            onClick={() => completePayout(payout.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => failPayout(payout.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Fail
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Payout Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900">Create Vendor Payout</h3>
            </div>

            <div className="p-6 space-y-4">
              {/* Vendor Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor *</label>
                <select
                  value={createForm.vendor_id}
                  onChange={(e) => setCreateForm({ ...createForm, vendor_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Vendor</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.business_name} ({vendor.business_email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Period */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Period Start *</label>
                  <input
                    type="date"
                    value={createForm.period_start}
                    onChange={(e) => setCreateForm({ ...createForm, period_start: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Period End *</label>
                  <input
                    type="date"
                    value={createForm.period_end}
                    onChange={(e) => setCreateForm({ ...createForm, period_end: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Calculate Button */}
              <button
                onClick={calculatePayout}
                disabled={calculating || !createForm.vendor_id || !createForm.period_start || !createForm.period_end}
                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {calculating ? 'Calculating...' : 'Calculate Payout'}
              </button>

              {/* Calculation Results */}
              {calculation && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-gray-900">Calculation Results</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Sales:</span>
                      <span className="font-medium text-gray-900">₹{parseFloat(calculation.total_sales).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Orders:</span>
                      <span className="font-medium text-gray-900">{calculation.total_orders}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Platform Commission ({calculation.commission_rate}%):</span>
                      <span className="font-medium">-₹{parseFloat(calculation.platform_commission).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>GST on Commission ({calculation.commission_gst_rate}%):</span>
                      <span className="font-medium">-₹{parseFloat(calculation.commission_gst).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>TDS ({calculation.tds_rate}%):</span>
                      <span className="font-medium">-₹{parseFloat(calculation.tds_amount).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-300 text-lg font-bold text-green-600">
                      <span>Net Amount:</span>
                      <span>₹{parseFloat(calculation.net_amount).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Adjustment */}
              {calculation && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adjustment Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={createForm.adjustment_amount}
                      onChange={(e) => setCreateForm({ ...createForm, adjustment_amount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">Use negative value for deduction, positive for addition</p>
                  </div>

                  {parseFloat(createForm.adjustment_amount) !== 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Adjustment Reason</label>
                      <textarea
                        value={createForm.adjustment_reason}
                        onChange={(e) => setCreateForm({ ...createForm, adjustment_reason: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                        placeholder="Reason for adjustment..."
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                    <textarea
                      value={createForm.admin_notes}
                      onChange={(e) => setCreateForm({ ...createForm, admin_notes: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="Internal notes..."
                    />
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCalculation(null);
                  setCreateForm({
                    vendor_id: '',
                    period_start: '',
                    period_end: '',
                    adjustment_amount: '0',
                    adjustment_reason: '',
                    admin_notes: '',
                  });
                }}
                className="flex-1 px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createPayout}
                disabled={!calculation}
                className="flex-1 px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Create Payout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Payout Details</h3>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(selectedPayout.status)}`}>
                  {selectedPayout.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Payout Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Payout Number</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedPayout.payout_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created Date</label>
                  <p className="text-lg font-semibold text-gray-900">{new Date(selectedPayout.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Vendor Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Vendor Information</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="text-sm"><span className="font-medium">Business Name:</span> {selectedPayout.vendor.business_name}</p>
                  <p className="text-sm"><span className="font-medium">Email:</span> {selectedPayout.vendor.business_email}</p>
                  <p className="text-sm"><span className="font-medium">Commission Rate:</span> {selectedPayout.commission_rate}%</p>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Financial Breakdown</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Period:</span>
                    <span className="font-medium">{new Date(selectedPayout.period_start).toLocaleDateString()} - {new Date(selectedPayout.period_end).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Orders:</span>
                    <span className="font-medium">{selectedPayout.total_orders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Sales:</span>
                    <span className="font-semibold text-gray-900">₹{parseFloat(selectedPayout.total_sales).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Platform Commission ({selectedPayout.commission_rate}%):</span>
                    <span className="font-medium">-₹{parseFloat(selectedPayout.platform_commission).toLocaleString('en-IN')}</span>
                  </div>
                  {selectedPayout.commission_gst && parseFloat(selectedPayout.commission_gst) > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>GST on Commission ({selectedPayout.commission_gst_rate}%):</span>
                      <span className="font-medium">-₹{parseFloat(selectedPayout.commission_gst).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-red-600">
                    <span>TDS ({selectedPayout.tds_rate}%):</span>
                    <span className="font-medium">-₹{parseFloat(selectedPayout.tds_amount).toLocaleString('en-IN')}</span>
                  </div>
                  {parseFloat(selectedPayout.adjustment_amount) !== 0 && (
                    <div className={`flex justify-between ${parseFloat(selectedPayout.adjustment_amount) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <span>Adjustment:</span>
                      <span className="font-medium">{parseFloat(selectedPayout.adjustment_amount) > 0 ? '+' : ''}₹{parseFloat(selectedPayout.adjustment_amount).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-gray-300 text-lg font-bold text-green-600">
                    <span>Net Amount:</span>
                    <span>₹{parseFloat(selectedPayout.net_amount).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              {selectedPayout.payment_reference && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Payment Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm"><span className="font-medium">Payment Method:</span> {selectedPayout.payment_method}</p>
                    <p className="text-sm"><span className="font-medium">Reference/UTR:</span> {selectedPayout.payment_reference}</p>
                    {selectedPayout.completed_at && (
                      <p className="text-sm"><span className="font-medium">Completed At:</span> {new Date(selectedPayout.completed_at).toLocaleString()}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

