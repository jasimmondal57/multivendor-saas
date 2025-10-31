'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface OrderItem {
  product_id: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  price: number;
  total: number;
}

interface OrderDetail {
  order_id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  order_date: string;
  delivered_at: string;
  payment_method: string;
  items_count: number;
  items: OrderItem[];
  order_total: number;
  platform_commission: number;
  commission_gst: number;
  tds_amount: number;
  return_shipping_fee: number;
  net_amount: number;
}

interface OrderBreakdown {
  payout: Payout;
  orders: OrderDetail[];
  summary: {
    total_orders: number;
    total_items: number;
    total_sales: number;
    total_commission: number;
    total_commission_gst: number;
    total_tds: number;
    total_return_shipping_fees: number;
    total_net_amount: number;
  };
}

interface Payout {
  id: number;
  payout_number: string;
  period_start: string;
  period_end: string;
  scheduled_payout_date?: string;
  earliest_delivery_date?: string;
  latest_delivery_date?: string;
  total_sales: number;
  platform_commission: number;
  commission_rate: number;
  commission_gst?: number;
  commission_gst_rate?: number;
  tds_amount: number;
  tds_rate: number;
  return_shipping_fees?: number;
  net_amount: number;
  total_orders: number;
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
  const [orderBreakdown, setOrderBreakdown] = useState<OrderBreakdown | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

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
      setLoadingOrders(true);
      const response = await api.get(`/v1/vendor/payouts/${payoutId}/orders`);
      if (response.data.success) {
        setOrderBreakdown(response.data.data);
        setSelectedPayout(response.data.data.payout);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch payout details:', error);
      alert('Failed to load payout details');
    } finally {
      setLoadingOrders(false);
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

      {/* Payout Details Modal with Order-wise Breakdown */}
      {showDetailsModal && selectedPayout && orderBreakdown && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Payout Details</h2>
                <p className="text-sm text-gray-500 mt-1">{selectedPayout.payout_number}</p>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setOrderBreakdown(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Payout Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-600 mb-1">Period</div>
                  <div className="font-semibold text-gray-900">
                    {new Date(selectedPayout.period_start).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - {new Date(selectedPayout.period_end).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  {selectedPayout.scheduled_payout_date && (
                    <div className="text-xs text-gray-600 mt-1">
                      Scheduled: {new Date(selectedPayout.scheduled_payout_date).toLocaleDateString('en-IN')}
                    </div>
                  )}
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-green-600 mb-1">Status</div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedPayout.status)}`}>
                    {selectedPayout.status}
                  </span>
                  {selectedPayout.completed_at && (
                    <div className="text-xs text-gray-600 mt-2">
                      Completed: {new Date(selectedPayout.completed_at).toLocaleDateString('en-IN')}
                    </div>
                  )}
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm text-purple-600 mb-1">Total Orders</div>
                  <div className="font-semibold text-gray-900 text-2xl">{orderBreakdown.summary.total_orders}</div>
                  <div className="text-xs text-gray-600 mt-1">{orderBreakdown.summary.total_items} items</div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Financial Breakdown
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Total Sales</div>
                    <div className="font-semibold text-gray-900">₹{orderBreakdown.summary.total_sales.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Commission ({selectedPayout.commission_rate}%)</div>
                    <div className="font-semibold text-red-600">-₹{orderBreakdown.summary.total_commission.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">GST ({selectedPayout.commission_gst_rate}%)</div>
                    <div className="font-semibold text-red-600">-₹{orderBreakdown.summary.total_commission_gst.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600 mb-1">TDS ({selectedPayout.tds_rate}%)</div>
                    <div className="font-semibold text-red-600">-₹{orderBreakdown.summary.total_tds.toLocaleString('en-IN')}</div>
                  </div>
                </div>
                {orderBreakdown.summary.total_return_shipping_fees > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Return Shipping Fees</span>
                      <span className="font-semibold text-red-600">-₹{orderBreakdown.summary.total_return_shipping_fees.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-lg">Net Payout Amount</span>
                    <span className="font-bold text-green-600 text-2xl">₹{orderBreakdown.summary.total_net_amount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Order-wise Details */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Order-wise Breakdown ({orderBreakdown.orders.length} orders)
                </h3>
                <div className="space-y-4">
                  {orderBreakdown.orders.map((order) => (
                    <div key={order.order_id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Order Header */}
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-900">{order.order_number}</div>
                            <div className="text-xs text-gray-600 mt-1">
                              {order.customer_name} • {new Date(order.order_date).toLocaleDateString('en-IN')}
                              {order.delivered_at && ` • Delivered: ${new Date(order.delivered_at).toLocaleDateString('en-IN')}`}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-gray-900">₹{order.order_total.toLocaleString('en-IN')}</div>
                            <div className="text-xs text-gray-600">{order.items_count} items</div>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="px-4 py-3 bg-white">
                        <div className="space-y-2 mb-3">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <div className="flex-1">
                                <span className="text-gray-900">{item.product_name}</span>
                                <span className="text-gray-500 ml-2">×{item.quantity}</span>
                              </div>
                              <div className="text-gray-900 font-medium">₹{item.total.toLocaleString('en-IN')}</div>
                            </div>
                          ))}
                        </div>

                        {/* Order Financial Breakdown */}
                        <div className="border-t border-gray-200 pt-3 space-y-1.5 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Order Total</span>
                            <span className="text-gray-900 font-medium">₹{order.order_total.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-red-600">
                            <span>Platform Commission</span>
                            <span className="font-medium">-₹{order.platform_commission.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-red-600">
                            <span>Commission GST</span>
                            <span className="font-medium">-₹{order.commission_gst.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between text-red-600">
                            <span>TDS</span>
                            <span className="font-medium">-₹{order.tds_amount.toLocaleString('en-IN')}</span>
                          </div>
                          {order.return_shipping_fee > 0 && (
                            <div className="flex justify-between text-red-600">
                              <span>Return Shipping Fee</span>
                              <span className="font-medium">-₹{order.return_shipping_fee.toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-2 border-t border-gray-200">
                            <span className="font-semibold text-gray-900">Net Amount</span>
                            <span className="font-bold text-green-600">₹{order.net_amount.toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setOrderBreakdown(null);
                }}
                className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
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

