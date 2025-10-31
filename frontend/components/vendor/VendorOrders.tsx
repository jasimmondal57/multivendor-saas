'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
// import VirtualizedOrderList from './VirtualizedOrderList'; // Temporarily disabled

interface OrderItem {
  id: number;
  product: { id: number; name: string; sku: string };
  quantity: number;
  price: number;
  status: string;
  vendor_status?: string;
}

interface Order {
  id: number;
  order_number: string;
  customer: { name: string; email: string; phone?: string };
  items: OrderItem[];
  total_amount: number;
  status: string;
  payment_status?: string;
  shipping_address?: any;
  created_at: string;
}

export default function VendorOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [useVirtualization, setUseVirtualization] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, perPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        per_page: perPage,
      };
      const response = await api.get('/v1/vendor/orders', { params });
      if (response.data.success) {
        const data = response.data.data;
        setOrders(data.data || []);
        setCurrentPage(data.current_page || 1);
        setTotalPages(data.last_page || 1);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId: number) => {
    try {
      const response = await api.get(`/v1/vendor/orders/${orderId}`);
      if (response.data.success) {
        setSelectedOrder(response.data.data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      alert('Failed to load order details');
    }
  };

  const handleUpdateItemStatus = async (orderId: number, itemId: number, newStatus: string) => {
    try {
      const response = await api.put(`/v1/vendor/orders/${orderId}/items/${itemId}/status`, {
        status: newStatus,
      });
      if (response.data.success) {
        alert('Order item status updated successfully!');
        handleViewOrder(orderId); // Refresh order details
        fetchOrders(); // Refresh orders list
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleReadyForPickup = async (orderId: number) => {
    if (!confirm('Mark all items as ready for pickup?')) return;

    try {
      const response = await api.post(`/v1/vendor/orders/${orderId}/ready-for-pickup`);
      if (response.data.success) {
        alert('Order marked as ready for pickup!');
        handleViewOrder(orderId);
        fetchOrders();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to mark as ready');
    }
  };

  const getFilteredOrders = () => {
    return orders.filter(order => {
      // Search filter
      if (searchQuery && !order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !order.customer.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }
      // Date range filter
      const orderDate = new Date(order.created_at);
      if (dateRange.from && orderDate < new Date(dateRange.from)) {
        return false;
      }
      if (dateRange.to && orderDate > new Date(dateRange.to)) {
        return false;
      }
      return true;
    });
  };

  const handleExportOrders = () => {
    const filteredOrders = getFilteredOrders();
    if (filteredOrders.length === 0) {
      alert('No orders to export');
      return;
    }

    const csvData = filteredOrders.map(order => ({
      'Order Number': order.order_number,
      'Customer': order.customer.name,
      'Email': order.customer.email,
      'Items': order.items.length,
      'Total Amount': order.total_amount,
      'Status': order.status,
      'Payment Status': order.payment_status || 'N/A',
      'Date': new Date(order.created_at).toLocaleDateString('en-IN'),
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => `"${row[h as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      packed: 'bg-purple-100 text-purple-800',
      ready_for_pickup: 'bg-indigo-100 text-indigo-800',
      shipped: 'bg-cyan-100 text-cyan-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      returned: 'bg-orange-100 text-orange-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders</h1>
          <p className="text-gray-600">Manage and track your orders</p>
        </div>
        <div className="flex space-x-3">
          {/* Virtual Scrolling Toggle - Temporarily Disabled */}
          {/* <button
            onClick={() => setUseVirtualization(!useVirtualization)}
            className={`px-4 py-2 border rounded-lg transition-all flex items-center ${
              useVirtualization
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            title={useVirtualization ? 'Disable Virtual Scrolling' : 'Enable Virtual Scrolling (Better Performance)'}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {useVirtualization ? 'Virtual Mode' : 'Normal Mode'}
          </button> */}
          <button
            onClick={handleExportOrders}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-xl shadow border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Order # or customer name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="packed">Packed</option>
              <option value="ready_for_pickup">Ready for Pickup</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* From Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-200">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : getFilteredOrders().length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getFilteredOrders().map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">#{order.order_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{order.customer?.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{order.items?.length || 0} items</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">₹{order.total_amount?.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, total)} of {total} orders
                  </span>
                  <select
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 border rounded-lg text-sm ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p>No orders yet</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Order #{selectedOrder.order_number}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Placed on {new Date(selectedOrder.created_at).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
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

            <div className="p-6 space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-gray-900">{selectedOrder.customer.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">{selectedOrder.customer.email}</span>
                  </div>
                  {selectedOrder.customer.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium text-gray-900">{selectedOrder.customer.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Order Items</h3>
                  <button
                    onClick={() => handleReadyForPickup(selectedOrder.id)}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                  >
                    Mark All Ready for Pickup
                  </button>
                </div>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                          <p className="text-sm text-gray-500">SKU: {item.product.sku}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Quantity: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            ₹{(item.quantity * item.price).toLocaleString('en-IN')}
                          </div>
                          <span className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(item.vendor_status || item.status)}`}>
                            {(item.vendor_status || item.status).replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Status Update Buttons */}
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => handleUpdateItemStatus(selectedOrder.id, item.id, 'processing')}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          disabled={item.vendor_status === 'processing'}
                        >
                          Mark Processing
                        </button>
                        <button
                          onClick={() => handleUpdateItemStatus(selectedOrder.id, item.id, 'packed')}
                          className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                          disabled={item.vendor_status === 'packed'}
                        >
                          Mark Packed
                        </button>
                        <button
                          onClick={() => handleUpdateItemStatus(selectedOrder.id, item.id, 'ready_for_pickup')}
                          className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                          disabled={item.vendor_status === 'ready_for_pickup'}
                        >
                          Ready for Pickup
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Status:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  {selectedOrder.payment_status && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Status:</span>
                      <span className="font-medium text-gray-900">{selectedOrder.payment_status}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-semibold text-gray-900">Total Amount:</span>
                    <span className="font-bold text-gray-900 text-lg">
                      ₹{selectedOrder.total_amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.shipping_address && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Shipping Address</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900">{selectedOrder.shipping_address.address_line1}</p>
                    {selectedOrder.shipping_address.address_line2 && (
                      <p className="text-gray-900">{selectedOrder.shipping_address.address_line2}</p>
                    )}
                    <p className="text-gray-900">
                      {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.pincode}
                    </p>
                  </div>
                </div>
              )}
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

