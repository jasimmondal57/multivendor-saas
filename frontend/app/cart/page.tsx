'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getSubtotal, getGST, getTotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center py-20">
            <div className="text-8xl mb-6">🛒</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet</p>
            <Link
              href="/products"
              className="inline-block px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg transition-all"
            >
              Start Shopping
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link></li>
            <li><span className="text-gray-400">/</span></li>
            <li><span className="text-gray-900 font-medium">Shopping Cart</span></li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart ({items.length} items)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => {
              const productImages = [
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop',
                'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&h=200&fit=crop',
                'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&h=200&fit=crop',
                'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=200&h=200&fit=crop',
              ];
              return (
                <div key={item.product.id} className="bg-white rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <Link href={`/products/${item.product.slug}`} className="flex-shrink-0">
                      <div className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden">
                        <img
                          src={productImages[index % productImages.length]}
                          alt={item.product.name}
                          className="w-full h-full object-cover hover:scale-110 transition-transform"
                        />
                      </div>
                    </Link>

                  {/* Product Details */}
                  <div className="flex-1">
                    <Link href={`/products/${item.product.slug}`}>
                      <h3 className="font-bold text-lg text-gray-900 hover:text-indigo-600 mb-1">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 mb-2">{item.product.category.name}</p>
                    <p className="text-xs text-gray-400 mb-3">Sold by: {item.product.vendor.business_name}</p>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          ₹{parseFloat(item.product.selling_price).toLocaleString('en-IN')}
                        </span>
                        {parseFloat(item.product.discount_percentage) > 0 && (
                          <>
                            <span className="text-sm text-gray-400 line-through">
                              ₹{parseFloat(item.product.mrp).toLocaleString('en-IN')}
                            </span>
                            <span className="text-sm text-green-600 font-semibold">
                              {parseFloat(item.product.discount_percentage).toFixed(0)}% off
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-indigo-600 hover:text-indigo-600 transition-colors"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock_quantity}
                          className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-indigo-600 hover:text-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Item Total</p>
                    <p className="text-xl font-bold text-gray-900">
                      ₹{(parseFloat(item.product.selling_price) * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-semibold">₹{getSubtotal().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%)</span>
                  <span className="font-semibold">₹{getGST().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    ₹{getTotal().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
              </div>

              <Link
                href="/checkout"
                className="block w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center font-bold rounded-xl hover:shadow-xl transition-all transform hover:scale-105"
              >
                Proceed to Checkout
              </Link>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-600">✓</span>
                  <span>Safe and Secure Payments</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-600">✓</span>
                  <span>100% Authentic Products</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-600">✓</span>
                  <span>Easy Returns & Refunds</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="mt-8 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            ← Continue Shopping
          </Link>
        </div>
      </main>
    </div>
  );
}

