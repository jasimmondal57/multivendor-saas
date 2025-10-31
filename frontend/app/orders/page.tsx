'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  price: string;
  total_amount: string;
}

interface Order {
  id: number;
  order_number: string;
  total_amount: string;
  status: string;
  payment_status: string;
  created_at: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchOrders();
    }
  }, [user, authLoading, router]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/v1/customer/orders');
      setOrders(response.data.data.data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-indigo-100 text-indigo-800',
      shipped: 'bg-purple-100 text-purple-800',
      out_for_delivery: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      returned: 'bg-gray-100 text-gray-800',
      refunded: 'bg-pink-100 text-pink-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <div>
                        <div className="text-sm text-gray-500">Order Number</div>
                        <div className="font-bold text-gray-900">{order.order_number}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Order Date</div>
                        <div className="font-medium text-gray-900">
                          {new Date(order.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Total Amount</div>
                        <div className="font-bold text-gray-900">₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{item.product_name}</div>
                          <div className="text-sm text-gray-500">Quantity: {item.quantity}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">₹{parseFloat(item.total_amount).toLocaleString('en-IN')}</div>
                          <div className="text-sm text-gray-500">₹{parseFloat(item.price).toLocaleString('en-IN')} each</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-3 gap-3">
                    <Link
                      href={`/orders/${order.id}`}
                      className="px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all text-center text-sm"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/orders/${order.id}/track`}
                      className="px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-center text-sm"
                    >
                      Track Order
                    </Link>
                    <Link
                      href={`/orders/${order.id}`}
                      className="px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all text-center text-sm flex items-center justify-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Invoice
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

