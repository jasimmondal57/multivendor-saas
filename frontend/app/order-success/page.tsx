'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { useEffect, useState, Suspense } from 'react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const [orderNumber] = useState(() => searchParams.get('order') || 'ORD' + Math.random().toString(36).substr(2, 9).toUpperCase());

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          {/* Success Animation */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <span className="text-5xl text-white">✓</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Order Placed Successfully!</h1>
            <p className="text-xl text-gray-600">Thank you for your purchase</p>
          </div>

          {/* Order Details */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-sm text-gray-600 mb-1">Order Number</p>
                <p className="text-lg font-bold text-gray-900">{orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Estimated Delivery</p>
                <p className="text-lg font-bold text-gray-900">3-5 Business Days</p>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="mb-8 text-left">
            <h2 className="text-xl font-bold text-gray-900 mb-4">What happens next?</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-indigo-600 font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Order Confirmation</p>
                  <p className="text-sm text-gray-600">You'll receive an email confirmation shortly</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-indigo-600 font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Order Processing</p>
                  <p className="text-sm text-gray-600">Vendor will prepare your order for shipment</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-indigo-600 font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Shipping Updates</p>
                  <p className="text-sm text-gray-600">Track your order status via email and SMS</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-indigo-600 font-bold">4</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Delivery</p>
                  <p className="text-sm text-gray-600">Your order will be delivered to your doorstep</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/orders"
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg transition-all"
            >
              View My Orders
            </Link>
            <Link
              href="/products"
              className="px-8 py-3 bg-white border-2 border-indigo-600 text-indigo-600 font-semibold rounded-full hover:bg-indigo-50 transition-all"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Support */}
          <div className="mt-8 pt-8 border-t">
            <p className="text-sm text-gray-600">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@multivendor.com" className="text-indigo-600 hover:underline">
                support@multivendor.com
              </a>
              {' '}or call{' '}
              <a href="tel:18001234567" className="text-indigo-600 hover:underline">
                1800-123-4567
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <Header />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <div className="animate-pulse">Loading...</div>
          </div>
        </main>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
