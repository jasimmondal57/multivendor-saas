'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface OrderItem {
  id: number;
  product: { id: number; name: string; sku: string };
  product_name: string;
  quantity: number;
  price: number;
  total_amount: number;
  status: string;
  vendor_status: string;
  accepted_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  ready_to_ship_at?: string;
}

interface Order {
  id: number;
  order_number: string;
  customer: { name: string; email: string; phone?: string };
  items: OrderItem[];
  total_amount: number;
  status: string;
  payment_method: string;
  payment_status?: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  created_at: string;
}

interface Shipment {
  id: number;
  awb_number?: string;
  tracking_id?: string;
  status: string;
  courier_partner: string;
  expected_delivery_date?: string;
  delivered_at?: string;
}

interface TimelineEvent {
  status: string;
  description: string;
  location?: string;
  timestamp: string;
  icon: string;
}

export default function VendorOrders() {
  const [activeTab, setActiveTab] = useState('new_orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedItem, setSelectedItem] = useState<OrderItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [packageDetails, setPackageDetails] = useState({
    weight: 0.5,
    length: 10,
    width: 10,
    height: 10,
    package_count: 1,
  });
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    new_orders: 0,
    to_ship: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/v1/vendor/orders');
      if (response.data.success) {
        const data = response.data.data;
        let filteredOrders = data.data || [];

        // Filter by tab
        filteredOrders = filteredOrders.filter((order: Order) => {
          const item = order.items[0];
          if (!item) return false;

          switch (activeTab) {
            case 'new_orders':
              return item.vendor_status === 'pending';
            case 'to_ship':
              return ['accepted', 'ready_to_ship'].includes(item.vendor_status);
            case 'shipped':
              return item.vendor_status === 'shipped';
            case 'delivered':
              return item.vendor_status === 'delivered';
            case 'cancelled':
              return ['rejected', 'cancelled'].includes(item.vendor_status);
            default:
              return true;
          }
        });

        setOrders(filteredOrders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/v1/vendor/orders');
      if (response.data.success) {
        const allOrders = response.data.data.data || [];
        const newStats = {
          new_orders: 0,
          to_ship: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
        };

        allOrders.forEach((order: Order) => {
          const item = order.items[0];
          if (!item) return;

          if (item.vendor_status === 'pending') newStats.new_orders++;
          else if (['accepted', 'ready_to_ship'].includes(item.vendor_status)) newStats.to_ship++;
          else if (item.vendor_status === 'shipped') newStats.shipped++;
          else if (item.vendor_status === 'delivered') newStats.delivered++;
          else if (['rejected', 'cancelled'].includes(item.vendor_status)) newStats.cancelled++;
        });

        setStats(newStats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleViewOrder = (order: Order, item: OrderItem) => {
    setSelectedOrder(order);
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const handleAcceptOrder = async (orderId: number, itemId: number) => {
    if (!confirm('Accept this order?')) return;

    try {
      const response = await api.post(`/v1/vendor/orders/${orderId}/items/${itemId}/accept`);
      if (response.data.success) {
        alert('Order accepted successfully!');
        fetchOrders();
        fetchStats();
        setShowDetailsModal(false);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to accept order');
    }
  };

  const handleRejectOrder = async () => {
    if (!selectedOrder || !selectedItem) return;
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const response = await api.post(
        `/v1/vendor/orders/${selectedOrder.id}/items/${selectedItem.id}/reject`,
        { reason: rejectionReason }
      );
      if (response.data.success) {
        alert('Order rejected successfully!');
        setShowRejectModal(false);
        setShowDetailsModal(false);
        setRejectionReason('');
        fetchOrders();
        fetchStats();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reject order');
    }
  };

  const handleMarkReadyToShip = async () => {
    if (!selectedOrder || !selectedItem) return;

    try {
      const response = await api.post(
        `/v1/vendor/orders/${selectedOrder.id}/items/${selectedItem.id}/ready-to-ship`,
        packageDetails
      );
      if (response.data.success) {
        alert('Order marked as ready to ship!');
        setShowPackageModal(false);
        setShowDetailsModal(false);
        fetchOrders();
        fetchStats();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to mark as ready to ship');
    }
  };

  const handleGenerateLabel = async (orderId: number, itemId: number) => {
    if (!confirm('Generate shipping label? This will create a shipment with Delhivery.')) return;

    try {
      const response = await api.post(`/v1/vendor/orders/${orderId}/items/${itemId}/generate-label`);
      if (response.data.success) {
        alert('Shipping label generated successfully!');
        fetchOrders();
        fetchStats();
        setShowDetailsModal(false);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to generate shipping label');
    }
  };

  const handleViewTimeline = async (orderId: number, itemId: number) => {
    try {
      const response = await api.get(`/v1/vendor/orders/${orderId}/items/${itemId}/timeline`);
      if (response.data.success) {
        setTimeline(response.data.data.timeline || []);
        setShipment(response.data.data.shipment);
        setShowTimelineModal(true);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to load timeline');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'New Order' },
      accepted: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Accepted' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
      ready_to_ship: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Ready to Ship' },
      shipped: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Shipped' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Delivered' },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Cancelled' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getPaymentBadge = (method: string) => {
    return method === 'cod' ? (
      <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded">
        COD
      </span>
    ) : (
      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
        Prepaid
      </span>
    );
  };

  const tabs = [
    { id: 'new_orders', label: 'New Orders', count: stats.new_orders, icon: '🔔', color: 'text-yellow-600' },
    { id: 'to_ship', label: 'To Ship', count: stats.to_ship, icon: '📦', color: 'text-blue-600' },
    { id: 'shipped', label: 'Shipped', count: stats.shipped, icon: '🚚', color: 'text-indigo-600' },
    { id: 'delivered', label: 'Delivered', count: stats.delivered, icon: '✅', color: 'text-green-600' },
    { id: 'cancelled', label: 'Cancelled', count: stats.cancelled, icon: '❌', color: 'text-red-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage your orders from acceptance to delivery</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[140px] px-6 py-4 text-sm font-semibold transition-all relative ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Found</h3>
              <p className="text-gray-600">No orders in this category yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const item = order.items[0];
                if (!item) return null;

                return (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{order.order_number}</h3>
                          {getStatusBadge(item.vendor_status)}
                          {getPaymentBadge(order.payment_method)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {order.customer.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(order.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">₹{parseFloat(item.total_amount.toString()).toFixed(2)}</div>
                        <div className="text-sm text-gray-600">{item.quantity} item(s)</div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                          <span className="text-2xl">📦</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{item.product_name || item.product.name}</h4>
                          <p className="text-sm text-gray-600">SKU: {item.product.sku}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity} × ₹{parseFloat(item.price.toString()).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{order.shipping_name}</p>
                          <p className="text-sm text-gray-700">{order.shipping_phone}</p>
                          <p className="text-sm text-gray-700">{order.shipping_address}</p>
                          <p className="text-sm text-gray-700">{order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {item.vendor_status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleAcceptOrder(order.id, item.id)}
                            className="flex-1 px-4 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Accept Order
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setSelectedItem(item);
                              setShowRejectModal(true);
                            }}
                            className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject Order
                          </button>
                        </>
                      )}

                      {item.vendor_status === 'accepted' && (
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setSelectedItem(item);
                            setShowPackageModal(true);
                          }}
                          className="flex-1 px-4 py-2.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          Mark Ready to Ship
                        </button>
                      )}

                      {item.vendor_status === 'ready_to_ship' && (
                        <button
                          onClick={() => handleGenerateLabel(order.id, item.id)}
                          className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          Generate Shipping Label
                        </button>
                      )}

                      <button
                        onClick={() => handleViewOrder(order, item)}
                        className="px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Details
                      </button>

                      {['shipped', 'delivered'].includes(item.vendor_status) && (
                        <button
                          onClick={() => handleViewTimeline(order.id, item.id)}
                          className="px-4 py-2.5 bg-blue-100 text-blue-700 font-semibold rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          Track Shipment
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Reject Order Modal */}
      {showRejectModal && selectedOrder && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Reject Order</h3>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting order <strong>{selectedOrder.order_number}</strong>
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason (e.g., Out of stock, Cannot fulfill order, etc.)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectOrder}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                Reject Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Package Details Modal */}
      {showPackageModal && selectedOrder && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Package Details</h3>
                <button
                  onClick={() => setShowPackageModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Enter package dimensions for order <strong>{selectedOrder.order_number}</strong>
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={packageDetails.weight}
                    onChange={(e) => setPackageDetails({ ...packageDetails, weight: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Package Count</label>
                  <input
                    type="number"
                    min="1"
                    value={packageDetails.package_count}
                    onChange={(e) => setPackageDetails({ ...packageDetails, package_count: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Length (cm)</label>
                  <input
                    type="number"
                    min="1"
                    value={packageDetails.length}
                    onChange={(e) => setPackageDetails({ ...packageDetails, length: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Width (cm)</label>
                  <input
                    type="number"
                    min="1"
                    value={packageDetails.width}
                    onChange={(e) => setPackageDetails({ ...packageDetails, width: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Height (cm)</label>
                  <input
                    type="number"
                    min="1"
                    value={packageDetails.height}
                    onChange={(e) => setPackageDetails({ ...packageDetails, height: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowPackageModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkReadyToShip}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors"
              >
                Mark Ready to Ship
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Modal */}
      {showTimelineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Order Timeline</h3>
                <button
                  onClick={() => setShowTimelineModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              {shipment && shipment.awb_number && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-indigo-900">AWB Number</p>
                      <p className="text-lg font-bold text-indigo-700">{shipment.awb_number}</p>
                    </div>
                    <button
                      onClick={() => navigator.clipboard.writeText(shipment.awb_number || '')}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <span className="text-lg">
                          {event.icon === 'shopping-cart' && '🛒'}
                          {event.icon === 'check-circle' && '✅'}
                          {event.icon === 'x-circle' && '❌'}
                          {event.icon === 'package' && '📦'}
                          {event.icon === 'truck' && '🚚'}
                        </span>
                      </div>
                      {index < timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <h4 className="font-bold text-gray-900">{event.status}</h4>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      {event.location && (
                        <p className="text-sm text-gray-500 mt-1">📍 {event.location}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedOrder.order_number}</h3>
                  <p className="text-sm text-gray-600 mt-1">Order Details</p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Status */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Status</h4>
                <div className="flex items-center gap-3">
                  {getStatusBadge(selectedItem.vendor_status)}
                  {getPaymentBadge(selectedOrder.payment_method)}
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Customer Information</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-semibold text-gray-900">{selectedOrder.customer.name}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.customer.email}</p>
                  {selectedOrder.customer.phone && (
                    <p className="text-sm text-gray-600">{selectedOrder.customer.phone}</p>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Shipping Address</h4>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="font-semibold text-gray-900">{selectedOrder.shipping_name}</p>
                  <p className="text-sm text-gray-700">{selectedOrder.shipping_phone}</p>
                  <p className="text-sm text-gray-700 mt-2">{selectedOrder.shipping_address}</p>
                  <p className="text-sm text-gray-700">{selectedOrder.shipping_city}, {selectedOrder.shipping_state} - {selectedOrder.shipping_pincode}</p>
                </div>
              </div>

              {/* Product Details */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Product Details</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900">{selectedItem.product_name || selectedItem.product.name}</h5>
                      <p className="text-sm text-gray-600">SKU: {selectedItem.product.sku}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-600">Qty: {selectedItem.quantity}</span>
                        <span className="text-sm text-gray-600">Price: ₹{parseFloat(selectedItem.price.toString()).toFixed(2)}</span>
                        <span className="text-sm font-bold text-gray-900">Total: ₹{parseFloat(selectedItem.total_amount.toString()).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rejection Reason */}
              {selectedItem.rejected_at && selectedItem.rejection_reason && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Rejection Reason</h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">{selectedItem.rejection_reason}</p>
                    <p className="text-xs text-red-600 mt-2">Rejected on {new Date(selectedItem.rejected_at).toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


