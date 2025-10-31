'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Payout {
  id: number;
  payout_number: string;
  period_start: string;
  period_end: string;
  total_sales: number;
  platform_commission: number;
  tds_amount: number;
  net_amount: number;
  status: string;
  completed_at?: string;
  created_at: string;
}

interface PayoutStats {
  total_earnings: number;
  pending_payout: number;
  this_month_earnings: number;
  last_payout_amount: number;
  last_payout_date?: string;
  current_period_sales: number;
  total_payouts_count: number;
  pending_payouts_count: number;
}

export default function VendorPayouts() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [stats, setStats] = useState<PayoutStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchPayouts();
    fetchStatistics();
  }, []);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/v1/vendor/payouts');
      if (response.data.success) {
        setPayouts(response.data.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/v1/vendor/payouts/statistics');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const handleViewDetails = async (payoutId: number) => {
    try {
      const response = await api.get(`/v1/vendor/payouts/${payoutId}`);
      if (response.data.success) {
        setSelectedPayout(response.data.data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch payout details:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

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
          <div className="text-3xl font-bold">₹{stats?.total_earnings.toLocaleString('en-IN') || 0}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="text-sm mb-2">Pending Payout</div>
          <div className="text-3xl font-bold">₹{stats?.pending_payout.toLocaleString('en-IN') || 0}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="text-sm mb-2">This Month</div>
          <div className="text-3xl font-bold">₹{stats?.this_month_earnings.toLocaleString('en-IN') || 0}</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="text-sm mb-2">Last Payout</div>
          <div className="text-3xl font-bold">₹{stats?.last_payout_amount.toLocaleString('en-IN') || 0}</div>
          {stats?.last_payout_date && (
            <div className="text-xs mt-1 opacity-90">
              {new Date(stats.last_payout_date).toLocaleDateString('en-IN')}
            </div>
          )}
        </div>
      </div>

      {/* Payout History */}
      <div className="bg-white rounded-xl shadow border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Payout History</h2>
        </div>
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : payouts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payout #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commission</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">TDS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{payout.payout_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(payout.period_start).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - {new Date(payout.period_end).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">₹{payout.total_sales.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-sm text-red-600">-₹{payout.platform_commission.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-sm text-red-600">-₹{payout.tds_amount.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">₹{payout.net_amount.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(payout.status)}`}>
                        {payout.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleViewDetails(payout.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p>No payout history available</p>
            <p className="text-sm mt-2">Your payouts will appear here once processed</p>
          </div>
        )}
      </div>

      {/* Payout Details Modal */}
      {showDetailsModal && selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Payout Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payout Number:</span>
                  <span className="font-medium text-gray-900">{selectedPayout.payout_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Period:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(selectedPayout.period_start).toLocaleDateString('en-IN')} - {new Date(selectedPayout.period_end).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedPayout.status)}`}>
                    {selectedPayout.status}
                  </span>
                </div>
                {selectedPayout.completed_at && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed On:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(selectedPayout.completed_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Breakdown</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Sales:</span>
                    <span className="font-medium text-gray-900">₹{selectedPayout.total_sales.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Platform Commission:</span>
                    <span className="font-medium">-₹{selectedPayout.platform_commission.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>TDS Deducted:</span>
                    <span className="font-medium">-₹{selectedPayout.tds_amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-semibold text-gray-900">Net Amount:</span>
                    <span className="font-bold text-green-600 text-lg">₹{selectedPayout.net_amount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
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

