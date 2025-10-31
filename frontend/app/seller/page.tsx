'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function SellerLandingPage() {
  const [activeTab, setActiveTab] = useState('benefits');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  MultiVendor SaaS
                </span>
              </Link>
              <span className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold rounded-full">
                Seller Portal
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/vendor/login"
                className="px-4 py-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
              >
                Seller Login
              </Link>
              <Link
                href="/vendor/register"
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Start Selling
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Start Your Online Business Today
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Join thousands of successful sellers on India's fastest-growing multi-vendor marketplace. 
                Reach millions of customers and grow your business with zero upfront costs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/vendor/register"
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 text-center flex items-center justify-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Start Selling Now
                </Link>
                <a
                  href="#how-it-works"
                  className="px-8 py-4 bg-white text-indigo-600 font-bold text-lg rounded-xl border-2 border-indigo-600 hover:bg-indigo-50 transition-all duration-200 text-center flex items-center justify-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  How It Works
                </a>
              </div>
              <div className="mt-8 flex items-center space-x-8">
                <div>
                  <div className="text-3xl font-bold text-indigo-600">10,000+</div>
                  <div className="text-gray-600">Active Sellers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600">5M+</div>
                  <div className="text-gray-600">Monthly Customers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-pink-600">₹50Cr+</div>
                  <div className="text-gray-600">Monthly Sales</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl p-8">
                <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-lg mb-4">
                      <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="text-2xl font-bold text-gray-700">Your Store</div>
                    <div className="text-gray-600">Starts Here</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Why Sell With Us?
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to succeed in e-commerce
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Low Commission</h3>
              <p className="text-gray-600 mb-4">
                Pay only 5-10% commission on sales. No hidden fees, no monthly charges.
                Keep more of what you earn.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  No setup fees
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  No monthly subscription
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Pay only on sales
                </li>
              </ul>
            </div>

            {/* Benefit 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Easy Setup</h3>
              <p className="text-gray-600 mb-4">
                Get your store live in just 30 minutes. Simple 5-step onboarding process
                with guided assistance.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Quick registration
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Easy product upload
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Instant store creation
                </li>
              </ul>
            </div>

            {/* Benefit 3 */}
            <div className="bg-gradient-to-br from-pink-50 to-indigo-50 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-600 to-indigo-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Fast Payouts</h3>
              <p className="text-gray-600 mb-4">
                Get paid within 7 days of order delivery. Direct bank transfer to your account.
                No delays, no hassles.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Weekly settlements
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Direct bank transfer
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Transparent tracking
                </li>
              </ul>
            </div>

            {/* Benefit 4 */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Analytics Dashboard</h3>
              <p className="text-gray-600 mb-4">
                Track your sales, orders, and revenue in real-time. Make data-driven decisions
                to grow your business.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Real-time reports
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Sales analytics
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Customer insights
                </li>
              </ul>
            </div>

            {/* Benefit 5 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Marketing Support</h3>
              <p className="text-gray-600 mb-4">
                Get featured in campaigns, deals, and promotions. Reach millions of customers
                through our marketing channels.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Featured listings
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Email campaigns
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Social media promotion
                </li>
              </ul>
            </div>

            {/* Benefit 6 */}
            <div className="bg-gradient-to-br from-pink-50 to-indigo-50 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-600 to-indigo-600 rounded-full flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Secure & Reliable</h3>
              <p className="text-gray-600 mb-4">
                Your data and payments are 100% secure. Bank-grade encryption and fraud protection
                for peace of mind.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  SSL encryption
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Fraud protection
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  24/7 support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Start selling in 4 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  1
                </div>
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800 text-center">Register</h3>
                <p className="text-gray-600 text-center">
                  Create your seller account in 2 minutes with basic details
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  2
                </div>
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800 text-center">Complete KYC</h3>
                <p className="text-gray-600 text-center">
                  Submit business documents and complete 5-step verification
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-pink-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  3
                </div>
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800 text-center">Add Products</h3>
                <p className="text-gray-600 text-center">
                  Upload your products with images, prices, and descriptions
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  4
                </div>
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800 text-center">Start Earning</h3>
                <p className="text-gray-600 text-center">
                  Receive orders, ship products, and get paid weekly
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/vendor/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
            >
              Get Started Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              Hear from our successful sellers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  RK
                </div>
                <div className="ml-4">
                  <div className="font-bold text-gray-800">Rajesh Kumar</div>
                  <div className="text-gray-600 text-sm">Electronics Seller</div>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "I started with just 10 products and now I'm selling 500+ items monthly. 
                The platform is easy to use and payouts are always on time!"
              </p>
              <div className="mt-4 text-indigo-600 font-bold">
                ₹5 Lakhs+ monthly revenue
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  PS
                </div>
                <div className="ml-4">
                  <div className="font-bold text-gray-800">Priya Sharma</div>
                  <div className="text-gray-600 text-sm">Fashion Seller</div>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "The analytics dashboard helps me understand my customers better. 
                I've grown my business 3x in just 6 months!"
              </p>
              <div className="mt-4 text-purple-600 font-bold">
                3x growth in 6 months
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gradient-to-br from-pink-50 to-indigo-50 rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  AM
                </div>
                <div className="ml-4">
                  <div className="font-bold text-gray-800">Amit Mehta</div>
                  <div className="text-gray-600 text-sm">Home Decor Seller</div>
                </div>
              </div>
              <p className="text-gray-700 italic">
                "Best decision I made for my business. Low commission and great support. 
                Highly recommend to all sellers!"
              </p>
              <div className="mt-4 text-pink-600 font-bold">
                1000+ orders fulfilled
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Selling Journey?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join 10,000+ successful sellers and start earning today. No setup fees, no hidden charges.
          </p>
          <Link
            href="/vendor/register"
            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-indigo-600 font-bold text-xl rounded-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            Start Selling Now - It's Free!
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <p className="mt-6 text-indigo-100">
            Already have an account?{' '}
            <Link href="/vendor/login" className="text-white font-semibold underline hover:text-indigo-100">
              Login here
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">
              © 2025 MultiVendor SaaS. All rights reserved.
            </p>
            <div className="mt-4 flex justify-center space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Seller Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Terms & Conditions
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

