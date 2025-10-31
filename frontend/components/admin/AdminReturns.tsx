'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface ReturnOrder {
  id: number;
  return_number: string;
  order_id: number;
  customer_id: number;
  vendor_id: number;
  product_id: number;
  status: string;
  reason: string;
  description: string;
  quantity: number;
  refund_amount: number;
  images: string[];
  rejection_reason?: string;
  created_at: string;
  approved_at?: string;
  rejected_at?: string;
  received_at?: string;
  refund_completed_at?: string;
  pickup_awb_number?: string;
  order: {
    order_number: string;
  };
  customer: {
    id: number;
    name: string;
    email: string;
  };
  vendor: {
    id: number;
    business_name: string;
  };
  product: {
    id: number;
    name: string;
    image: string;
  };
}

interface ReturnStats {
  total_returns: number;
  pending_approval: number;
  approved: number;
  rejected: number;
  in_transit: number;
  received: number;
  refund_pending: number;
  completed: number;
  total_refund_amount: number;
  pending_refund_amount: number;
  reasons: { [key: string]: number };
}

export default function AdminReturns() {
  const [activeTab, setActiveTab] = useState('pending_approval');
  const [returns, setReturns] = useState<ReturnOrder[]>([]);
  const [stats, setStats] = useState<ReturnStats>({
    total_returns: 0,
    pending_approval: 0,
    approved: 0,
    rejected: 0,
    in_transit: 0,
    received: 0,
    refund_pending: 0,
    completed: 0,
    total_refund_amount: 0,
    pending_refund_amount: 0,
    reasons: {},
  });
  const [loading, setLoading] = useState(true);
  const [selectedReturns, setSelectedReturns] = useState<number[]>([]);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<ReturnOrder | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [refundTransactionId, setRefundTransactionId] = useState('');
  const [refundMethod, setRefundMethod] = useState('original_payment');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    vendor_id: '',
    customer_id: '',
    from_date: '',
    to_date: '',
  });

  useEffect(() => {
    fetchStats();
    fetchReturns();
  }, [activeTab, searchQuery, filters]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/returns/statistics');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const params: any = {};
      
      if (activeTab !== 'all') {
        params.status = activeTab;
      }
      
      if (searchQuery) {
        params.search = searchQuery;
      }

      if (filters.vendor_id) params.vendor_id = filters.vendor_id;
      if (filters.customer_id) params.customer_id = filters.customer_id;
      if (filters.from_date) params.from_date = filters.from_date;
      if (filters.to_date) params.to_date = filters.to_date;

      const response = await api.get('/admin/returns', { params });
      
      if (response.data.success) {
        setReturns(response.data.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectReturn = (id: number) => {
    setSelectedReturns(prev => 
      prev.includes(id) ? prev.filter(returnId => returnId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedReturns.length === returns.length) {
      setSelectedReturns([]);
    } else {
      setSelectedReturns(returns.map(r => r.id));
    }
  };

  const handleApprove = async (returnId?: number) => {
    try {
      if (returnId) {
        // Single approve
        const response = await api.post(`/admin/returns/${returnId}/approve`);
        if (response.data.success) {
          alert('Return approved successfully');
          fetchReturns();
          fetchStats();
        }
      } else {
        // Bulk approve
        const response = await api.post('/admin/returns/bulk-approve', {
          return_ids: selectedReturns,
        });
        if (response.data.success) {
          alert(`${response.data.approved_count} return(s) approved successfully`);
          setSelectedReturns([]);
          setShowApproveModal(false);
          fetchReturns();
          fetchStats();
        }
      }
    } catch (error: any) {
      console.error('Error approving return:', error);
      alert(error.response?.data?.message || 'Failed to approve return');
    }
  };

  const handleReject = async (returnId?: number) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      if (returnId) {
        // Single reject
        const response = await api.post(`/admin/returns/${returnId}/reject`, {
          reason: rejectionReason,
        });
        if (response.data.success) {
          alert('Return rejected successfully');
          setRejectionReason('');
          setSelectedReturn(null);
          setShowRejectModal(false);
          fetchReturns();
          fetchStats();
        }
      } else {
        // Bulk reject
        const response = await api.post('/admin/returns/bulk-reject', {
          return_ids: selectedReturns,
          reason: rejectionReason,
        });
        if (response.data.success) {
          alert(`${response.data.rejected_count} return(s) rejected successfully`);
          setRejectionReason('');
          setSelectedReturns([]);
          setShowRejectModal(false);
          fetchReturns();
          fetchStats();
        }
      }
    } catch (error: any) {
      console.error('Error rejecting return:', error);
      alert(error.response?.data?.message || 'Failed to reject return');
    }
  };

  const handleForceCompleteRefund = async () => {
    if (!selectedReturn || !refundTransactionId.trim()) {
      alert('Please provide transaction ID');
      return;
    }

    try {
      const response = await api.post(`/admin/returns/${selectedReturn.id}/force-complete-refund`, {
        transaction_id: refundTransactionId,
        refund_method: refundMethod,
      });

      if (response.data.success) {
        alert('Refund marked as completed successfully');
        setRefundTransactionId('');
        setRefundMethod('original_payment');
        setSelectedReturn(null);
        setShowRefundModal(false);
        fetchReturns();
        fetchStats();
      }
    } catch (error: any) {
      console.error('Error completing refund:', error);
      alert(error.response?.data?.message || 'Failed to complete refund');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending_approval: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      in_transit: 'bg-blue-100 text-blue-800',
      received: 'bg-purple-100 text-purple-800',
      inspection_passed: 'bg-teal-100 text-teal-800',
      refund_initiated: 'bg-indigo-100 text-indigo-800',
      refund_completed: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const tabs = [
    { id: 'all', label: 'All Returns', count: stats.total_returns },
    { id: 'pending_approval', label: 'Pending Approval', count: stats.pending_approval },
    { id: 'approved', label: 'Approved', count: stats.approved },
    { id: 'rejected', label: 'Rejected', count: stats.rejected },
    { id: 'in_transit', label: 'In Transit', count: stats.in_transit },
    { id: 'received', label: 'Received', count: stats.received },
    { id: 'refund_pending', label: 'Refund Pending', count: stats.refund_pending },
    { id: 'completed', label: 'Completed', count: stats.completed },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Return Management</h2>
          <p className="text-gray-600 mt-1">Manage customer return requests and refunds</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Pending Approval</p>
              <p className="text-3xl font-bold mt-2">{stats.pending_approval}</p>
            </div>
            <svg className="w-12 h-12 text-yellow-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">In Transit</p>
              <p className="text-3xl font-bold mt-2">{stats.in_transit}</p>
            </div>
            <svg className="w-12 h-12 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Refund Pending</p>
              <p className="text-3xl font-bold mt-2">{stats.refund_pending}</p>
              <p className="text-purple-100 text-xs mt-1">{formatCurrency(stats.pending_refund_amount)}</p>
            </div>
            <svg className="w-12 h-12 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Refunded</p>
              <p className="text-3xl font-bold mt-2">{stats.completed}</p>
              <p className="text-green-100 text-xs mt-1">{formatCurrency(stats.total_refund_amount)}</p>
            </div>
            <svg className="w-12 h-12 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search by return number, order, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <input
            type="date"
            placeholder="From Date"
            value={filters.from_date}
            onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <input
            type="date"
            placeholder="To Date"
            value={filters.to_date}
            onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <button
            onClick={() => {
              setSearchQuery('');
              setFilters({ vendor_id: '', customer_id: '', from_date: '', to_date: '' });
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedReturns.length > 0 && activeTab === 'pending_approval' && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
          <p className="text-blue-900 font-medium">
            {selectedReturns.length} return(s) selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowApproveModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Bulk Approve
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Bulk Reject
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedReturns([]);
                }}
                className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-red-600 text-red-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  activeTab === tab.id ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Returns Table */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              <p className="text-gray-600 mt-4">Loading returns...</p>
            </div>
          ) : returns.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-600 text-lg">No returns found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    {activeTab === 'pending_approval' && (
                      <th className="text-left py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedReturns.length === returns.length}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                      </th>
                    )}
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Return #</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Order #</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Vendor</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Reason</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {returns.map((returnOrder) => (
                    <tr key={returnOrder.id} className="border-b border-gray-100 hover:bg-gray-50">
                      {activeTab === 'pending_approval' && (
                        <td className="py-4 px-4">
                          <input
                            type="checkbox"
                            checked={selectedReturns.includes(returnOrder.id)}
                            onChange={() => handleSelectReturn(returnOrder.id)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                        </td>
                      )}
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm font-medium text-gray-900">
                          {returnOrder.return_number}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-sm text-gray-600">
                          {returnOrder.order.order_number}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{returnOrder.customer.name}</p>
                          <p className="text-sm text-gray-500">{returnOrder.customer.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-900">{returnOrder.vendor.business_name}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {returnOrder.product.image && (
                            <img
                              src={returnOrder.product.image}
                              alt={returnOrder.product.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{returnOrder.product.name}</p>
                            <p className="text-xs text-gray-500">Qty: {returnOrder.quantity}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">{formatStatus(returnOrder.reason)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(returnOrder.refund_amount)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(returnOrder.status)}`}>
                          {formatStatus(returnOrder.status)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">
                          {new Date(returnOrder.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          {returnOrder.status === 'pending_approval' && (
                            <>
                              <button
                                onClick={() => handleApprove(returnOrder.id)}
                                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                title="Approve"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedReturn(returnOrder);
                                  setShowRejectModal(true);
                                }}
                                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                title="Reject"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </>
                          )}
                          {['inspection_passed', 'refund_initiated'].includes(returnOrder.status) && (
                            <button
                              onClick={() => {
                                setSelectedReturn(returnOrder);
                                setShowRefundModal(true);
                              }}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Force Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Confirm Bulk Approval</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to approve {selectedReturns.length} return request(s)?
              Delhivery pickup will be automatically scheduled for each approved return.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleApprove()}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Approve All
              </button>
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {selectedReturn ? 'Reject Return Request' : 'Bulk Reject Returns'}
            </h3>
            <p className="text-gray-600 mb-4">
              {selectedReturn
                ? `Rejecting return request ${selectedReturn.return_number}`
                : `Rejecting ${selectedReturns.length} return request(s)`
              }
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-6"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleReject(selectedReturn?.id)}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                  setSelectedReturn(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Force Complete Refund Modal */}
      {showRefundModal && selectedReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Force Complete Refund</h3>
            <p className="text-gray-600 mb-4">
              Return: {selectedReturn.return_number}<br />
              Amount: {formatCurrency(selectedReturn.refund_amount)}
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction ID
                </label>
                <input
                  type="text"
                  value={refundTransactionId}
                  onChange={(e) => setRefundTransactionId(e.target.value)}
                  placeholder="Enter transaction ID"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Method
                </label>
                <select
                  value={refundMethod}
                  onChange={(e) => setRefundMethod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="original_payment">Original Payment Method</option>
                  <option value="wallet">Wallet</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleForceCompleteRefund}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Complete Refund
              </button>
              <button
                onClick={() => {
                  setShowRefundModal(false);
                  setRefundTransactionId('');
                  setRefundMethod('original_payment');
                  setSelectedReturn(null);
                }}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
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

