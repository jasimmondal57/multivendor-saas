'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import MultiVendorInvoices from '@/components/customer/MultiVendorInvoices';

interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  price: string;
  tax_amount: string;
  discount_amount: string;
  total_amount: string;
  status: string;
  product?: {
    id: number;
    name: string;
    slug: string;
    image?: string;
  };
  vendor?: {
    id: number;
    business_name: string;
    business_email?: string;
    business_phone?: string;
    business_address?: string;
    business_city?: string;
    business_state?: string;
    business_pincode?: string;
    gstin?: string;
    store?: {
      store_name: string;
      customer_support_email?: string;
      customer_support_phone?: string;
    };
  };
}

interface Order {
  id: number;
  uuid: string;
  order_number: string;
  invoice_number?: string;
  invoice_generated_at?: string;
  customer_id: number;
  subtotal: string;
  tax_amount: string;
  shipping_charge: string;
  discount_amount: string;
  total_amount: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_email: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  shipping_country: string;
  billing_name: string;
  billing_phone: string;
  billing_email: string;
  billing_address: string;
  billing_city: string;
  billing_state: string;
  billing_pincode: string;
  billing_country: string;
  payment_method: string;
  payment_status: string;
  status: string;
  customer_notes: string | null;
  awb_number: string | null;
  courier_name: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchOrderDetails();
    }
  }, [user, authLoading, router]);

  const fetchOrderDetails = async () => {
    try {
      const response = await api.get(`/v1/customer/orders/${params.id}`);
      setOrder(response.data.data);
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      if (error.response?.status === 401) {
        router.push('/login');
      } else if (error.response?.status === 404) {
        // Order not found
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
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

  const getPaymentStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-pink-100 text-pink-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link
              href="/orders"
              className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Back to Orders
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link 
            href="/orders" 
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Orders
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Details</h1>
          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-gray-600">Order #{order.order_number}</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status.replace('_', ' ').toUpperCase()}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.payment_status)}`}>
              Payment: {order.payment_status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.product?.image ? (
                        <img src={item.product.image} alt={item.product_name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.product_name}</h3>
                      <p className="text-sm text-gray-500">SKU: {item.product_sku}</p>
                      <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                      <p className="text-sm text-gray-600">Price: ₹{parseFloat(item.price).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{parseFloat(item.total_amount).toLocaleString('en-IN')}</p>
                      <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Address</h2>
              <div className="text-gray-700">
                <p className="font-semibold">{order.shipping_name}</p>
                <p>{order.shipping_address}</p>
                <p>{order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</p>
                <p>{order.shipping_country}</p>
                <p className="mt-2">Phone: {order.shipping_phone}</p>
                {order.shipping_email && <p>Email: {order.shipping_email}</p>}
              </div>
            </div>

            {/* Tracking Info */}
            {(order.awb_number || order.courier_name) && (
              <div className="bg-white rounded-2xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Tracking Information</h2>
                <div className="space-y-2">
                  {order.awb_number && (
                    <div>
                      <span className="text-sm text-gray-500">Tracking Number:</span>
                      <p className="font-semibold text-indigo-600">{order.awb_number}</p>
                    </div>
                  )}
                  {order.courier_name && (
                    <div>
                      <span className="text-sm text-gray-500">Courier Partner:</span>
                      <p className="font-semibold text-gray-900">{order.courier_name}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{parseFloat(order.subtotal).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax (GST 18%)</span>
                  <span>₹{parseFloat(order.tax_amount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span>₹{parseFloat(order.shipping_charge).toLocaleString('en-IN')}</span>
                </div>
                {parseFloat(order.discount_amount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{parseFloat(order.discount_amount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg text-gray-900">
                  <span>Total</span>
                  <span>₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Information</h2>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Payment Method:</span>
                  <p className="font-semibold text-gray-900 uppercase">{order.payment_method}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Payment Status:</span>
                  <p className={`font-semibold uppercase ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {order.payment_status}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Information</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Order Date:</span>
                  <p className="font-medium text-gray-900">{formatDate(order.created_at)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>
                  <p className="font-medium text-gray-900">{formatDate(order.updated_at)}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => setShowInvoice(true)}
                className="block w-full px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all text-center flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Invoice
              </button>
              <Link
                href={`/orders/${order.id}/track`}
                className="block w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all text-center"
              >
                Track Order
              </Link>
              {order.status === 'pending' && (
                <button
                  className="block w-full px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors text-center"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Invoice Modal */}
      {showInvoice && order && (
        <MultiVendorInvoices order={order} onClose={() => setShowInvoice(false)} />
      )}
    </div>
  );
}

