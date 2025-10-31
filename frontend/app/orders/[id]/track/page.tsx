'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import api from '@/lib/api';

interface TimelineItem {
  status: string;
  date: string | null;
  completed: boolean;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  total_amount: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  awb_number: string | null;
  courier_name: string | null;
}

export default function OrderTrackingPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderTracking();
  }, []);

  const fetchOrderTracking = async () => {
    try {
      const response = await api.get(`/v1/customer/orders/${params.id}/track`);
      setOrder(response.data.data.order);
      setTimeline(response.data.data.timeline);
    } catch (error) {
      console.error('Error fetching order tracking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Order not found</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link href="/orders" className="text-gray-500 hover:text-gray-700">My Orders</Link></li>
            <li><span className="text-gray-400">/</span></li>
            <li><span className="text-gray-900 font-medium">Track Order</span></li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">Order #{order.order_number}</p>
        </div>

        {/* Order Info Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Order Total</div>
              <div className="text-2xl font-bold text-gray-900">₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</div>
            </div>
            {order.awb_number && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Tracking Number</div>
                <div className="text-lg font-semibold text-indigo-600">{order.awb_number}</div>
              </div>
            )}
            {order.courier_name && (
              <div>
                <div className="text-sm text-gray-500 mb-1">Courier Partner</div>
                <div className="text-lg font-semibold text-gray-900">{order.courier_name}</div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500 mb-2">Delivery Address</div>
            <div className="text-gray-900">
              {order.shipping_address}, {order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-8">Order Timeline</h2>

          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            {/* Timeline Items */}
            <div className="space-y-8">
              {timeline.map((item, index) => (
                <div key={index} className="relative flex items-start gap-6">
                  {/* Icon */}
                  <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${
                    item.completed 
                      ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {item.completed ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <div className={`text-lg font-semibold ${item.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                      {item.status}
                    </div>
                    {item.date && (
                      <div className="text-sm text-gray-500 mt-1">{item.date}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <Link
            href={`/orders/${order.id}`}
            className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all text-center"
          >
            View Order Details
          </Link>
          <Link
            href="/orders"
            className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-center"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

