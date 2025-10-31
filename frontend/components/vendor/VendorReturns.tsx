'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface ReturnOrder {
  id: number;
  return_number: string;
  order_id: number;
  order_item_id: number;
  customer_id: number;
  vendor_id: number;
  product_id: number;
  return_type: 'refund' | 'replacement' | 'exchange';
  reason: string;
  reason_description: string | null;
  quantity: number;
  refund_amount: string;
  status: string;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  received_at: string | null;
  inspected_at: string | null;
  inspection_notes: string | null;
  inspection_passed: boolean | null;
  pickup_awb_number: string | null;
  pickup_tracking_id: string | null;
  pickup_scheduled_at: string | null;
  picked_up_at: string | null;
  refund_initiated_at: string | null;
  refund_completed_at: string | null;
  refund_transaction_id: string | null;
  refund_method: string | null;
  images: string[] | null;
  courier_partner: string | null;
  created_at: string;
  updated_at: string;
  order: {
    id: number;
    order_number: string;
    shipping_name: string;
    shipping_address: string;
    shipping_city: string;
    shipping_state: string;
    shipping_pincode: string;
    shipping_phone: string;
  };
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
  product: {
    id: number;
    name: string;
    sku: string;
    image: string | null;
  };
  order_item: {
    id: number;
    product_name: string;
    price: string;
    quantity: number;
  };
}

interface ReturnStats {
  pending_approval: number;
  in_transit: number;
  received: number;
  refund_pending: number;
  completed: number;
  rejected: number;
}

interface TimelineEvent {
  status: string;
  description: string;
  location: string | null;
  timestamp: string;
  icon: string;
}

export default function VendorReturns() {
  const [activeTab, setActiveTab] = useState('pending_approval');
  const [returns, setReturns] = useState<ReturnOrder[]>([]);
  const [stats, setStats] = useState<ReturnStats>({
    pending_approval: 0,
    in_transit: 0,
    received: 0,
    refund_pending: 0,
    completed: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState<ReturnOrder | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [inspectionPassed, setInspectionPassed] = useState(true);
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [refundMethod, setRefundMethod] = useState('original_payment');

  useEffect(() => {
    fetchStats();
    fetchReturns();
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/vendor/returns/statistics');
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
      const statusMap: { [key: string]: string } = {
        'pending_approval': 'pending_approval',
        'in_transit': 'pickup_scheduled,in_transit,out_for_pickup,picked_up',
        'received': 'received,inspecting',
        'refund_pending': 'inspection_passed,refund_initiated',
        'completed': 'refund_completed,completed',
        'rejected': 'rejected,inspection_failed',
      };

      const status = statusMap[activeTab] || activeTab;
      const response = await api.get(`/vendor/returns?status=${status}`);

      if (response.data.success) {
        setReturns(response.data.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (returnOrder: ReturnOrder) => {
    try {
      const response = await api.post(`/vendor/returns/${returnOrder.id}/approve`);

      if (response.data.success) {
        alert('Return request approved successfully');
        fetchReturns();
        fetchStats();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to approve return');
      }
    } catch (error) {
      console.error('Error approving return:', error);
      alert('Failed to approve return');
    }
  };

  const handleReject = async () => {
    if (!selectedReturn || !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const response = await api.post(`/vendor/returns/${selectedReturn.id}/reject`, {
        reason: rejectionReason,
      });

      if (response.data.success) {
        alert('Return request rejected successfully');
        setShowRejectModal(false);
        setRejectionReason('');
        setSelectedReturn(null);
        fetchReturns();
        fetchStats();
      } else {
        alert(response.data.message || 'Failed to reject return');
      }
    } catch (error: any) {
      console.error('Error rejecting return:', error);
      alert(error.response?.data?.message || 'Failed to reject return');
    }
  };

  const handleSchedulePickup = async () => {
    if (!selectedReturn || !pickupDate) {
      alert('Please select a pickup date');
      return;
    }

    try {
      const response = await api.post(`/vendor/returns/${selectedReturn.id}/schedule-pickup`, {
        pickup_date: pickupDate,
      });

      if (response.data.success) {
        alert('Pickup scheduled successfully');
        setShowPickupModal(false);
        setPickupDate('');
        setSelectedReturn(null);
        fetchReturns();
        fetchStats();
      } else {
        alert(response.data.message || 'Failed to schedule pickup');
      }
    } catch (error: any) {
      console.error('Error scheduling pickup:', error);
      alert(error.response?.data?.message || 'Failed to schedule pickup');
    }
  };

  const handleMarkReceived = async (returnOrder: ReturnOrder) => {
    try {
      const response = await api.post(`/vendor/returns/${returnOrder.id}/mark-received`);

      if (response.data.success) {
        alert('Return marked as received');
        fetchReturns();
        fetchStats();
      } else {
        alert(response.data.message || 'Failed to mark as received');
      }
    } catch (error: any) {
      console.error('Error marking as received:', error);
      alert(error.response?.data?.message || 'Failed to mark as received');
    }
  };

  const handleCompleteInspection = async () => {
    if (!selectedReturn) return;

    try {
      const response = await api.post(`/vendor/returns/${selectedReturn.id}/complete-inspection`, {
        passed: inspectionPassed,
        notes: inspectionNotes,
      });

      if (response.data.success) {
        alert('Inspection completed successfully');
        setShowInspectionModal(false);
        setInspectionNotes('');
        setSelectedReturn(null);
        fetchReturns();
        fetchStats();
      } else {
        alert(response.data.message || 'Failed to complete inspection');
      }
    } catch (error: any) {
      console.error('Error completing inspection:', error);
      alert(error.response?.data?.message || 'Failed to complete inspection');
    }
  };

  const handleInitiateRefund = async () => {
    if (!selectedReturn) return;

    try {
      const response = await api.post(`/vendor/returns/${selectedReturn.id}/initiate-refund`, {
        refund_method: refundMethod,
      });

      if (response.data.success) {
        alert('Refund initiated successfully');
        setShowRefundModal(false);
        setSelectedReturn(null);
        fetchReturns();
        fetchStats();
      } else {
        alert(response.data.message || 'Failed to initiate refund');
      }
    } catch (error: any) {
      console.error('Error initiating refund:', error);
      alert(error.response?.data?.message || 'Failed to initiate refund');
    }
  };

  const fetchTimeline = async (returnOrder: ReturnOrder) => {
    try {
      const response = await api.get(`/vendor/returns/${returnOrder.id}/timeline`);

      if (response.data.success) {
        setTimeline(response.data.data.timeline || []);
        setSelectedReturn(returnOrder);
        setShowTimelineModal(true);
      }
    } catch (error) {
      console.error('Error fetching timeline:', error);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'requested': 'bg-gray-100 text-gray-800',
      'pending_approval': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'pickup_scheduled': 'bg-blue-100 text-blue-800',
      'in_transit': 'bg-indigo-100 text-indigo-800',
      'picked_up': 'bg-purple-100 text-purple-800',
      'received': 'bg-teal-100 text-teal-800',
      'inspecting': 'bg-orange-100 text-orange-800',
      'inspection_passed': 'bg-green-100 text-green-800',
      'inspection_failed': 'bg-red-100 text-red-800',
      'refund_initiated': 'bg-blue-100 text-blue-800',
      'refund_completed': 'bg-green-100 text-green-800',
      'completed': 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getReturnTypeBadge = (type: string) => {
    const badges: { [key: string]: string } = {
      'refund': 'bg-blue-100 text-blue-800',
      'replacement': 'bg-purple-100 text-purple-800',
      'exchange': 'bg-orange-100 text-orange-800',
    };
    return badges[type] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const tabs = [
    {
      id: 'pending_approval',
      label: 'Pending Approval',
      count: stats.pending_approval,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-yellow-600',
    },
    {
      id: 'in_transit',
      label: 'In Transit',
      count: stats.in_transit,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
      color: 'text-indigo-600',
    },
    {
      id: 'received',
      label: 'Received',
      count: stats.received,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      ),
      color: 'text-teal-600',
    },
    {
      id: 'refund_pending',
      label: 'Refund Pending',
      count: stats.refund_pending,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      color: 'text-blue-600',
    },
    {
      id: 'completed',
      label: 'Completed',
      count: stats.completed,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-green-600',
    },
    {
      id: 'rejected',
      label: 'Rejected',
      count: stats.rejected,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-red-600',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Return Orders</h1>
        <p className="text-gray-600 mt-1">Manage product returns and refunds</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                ${activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span className={activeTab === tab.id ? tab.color : ''}>{tab.icon}</span>
              {tab.label}
              <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${activeTab === tab.id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Returns List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Loading returns...</p>
        </div>
      ) : returns.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No returns found</h3>
          <p className="mt-1 text-sm text-gray-500">No return orders in this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {returns.map((returnOrder) => (
            <div key={returnOrder.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              {/* Return Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{returnOrder.return_number}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(returnOrder.status)}`}>
                      {returnOrder.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReturnTypeBadge(returnOrder.return_type)}`}>
                      {returnOrder.return_type.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Order: {returnOrder.order?.order_number}</p>
                  <p className="text-sm text-gray-600">Requested: {formatDate(returnOrder.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">₹{parseFloat(returnOrder.refund_amount).toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Refund Amount</p>
                </div>
              </div>

              {/* Product & Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Product</h4>
                  <p className="text-sm text-gray-900">{returnOrder.product?.name || returnOrder.order_item?.product_name}</p>
                  <p className="text-sm text-gray-600">SKU: {returnOrder.product?.sku || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Quantity: {returnOrder.quantity}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Customer</h4>
                  <p className="text-sm text-gray-900">{returnOrder.customer?.name}</p>
                  <p className="text-sm text-gray-600">{returnOrder.customer?.email}</p>
                  <p className="text-sm text-gray-600">{returnOrder.customer?.phone || 'N/A'}</p>
                </div>
              </div>

              {/* Return Reason */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-1">Return Reason</h4>
                <p className="text-sm text-gray-900">{returnOrder.reason.replace(/_/g, ' ').toUpperCase()}</p>
                {returnOrder.reason_description && (
                  <p className="text-sm text-gray-600 mt-1">{returnOrder.reason_description}</p>
                )}
              </div>

              {/* Action Buttons - Context Aware */}
              <div className="flex flex-wrap gap-2">
                {returnOrder.status === 'pending_approval' && (
                  <>
                    <button
                      onClick={() => handleApprove(returnOrder)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      Approve Return
                    </button>
                    <button
                      onClick={() => {
                        setSelectedReturn(returnOrder);
                        setShowRejectModal(true);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Reject Return
                    </button>
                  </>
                )}

                {returnOrder.status === 'approved' && (
                  <button
                    onClick={() => {
                      setSelectedReturn(returnOrder);
                      setShowPickupModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Schedule Pickup
                  </button>
                )}

                {['in_transit', 'picked_up'].includes(returnOrder.status) && (
                  <button
                    onClick={() => handleMarkReceived(returnOrder)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                  >
                    Mark as Received
                  </button>
                )}

                {returnOrder.status === 'received' && (
                  <button
                    onClick={() => {
                      setSelectedReturn(returnOrder);
                      setShowInspectionModal(true);
                    }}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                  >
                    Complete Inspection
                  </button>
                )}

                {returnOrder.status === 'inspection_passed' && (
                  <button
                    onClick={() => {
                      setSelectedReturn(returnOrder);
                      setShowRefundModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Initiate Refund
                  </button>
                )}

                <button
                  onClick={() => fetchTimeline(returnOrder)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  View Timeline
                </button>

                <button
                  onClick={() => {
                    setSelectedReturn(returnOrder);
                    setShowDetailsModal(true);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


