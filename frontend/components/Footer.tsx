import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-xl font-bold">MultiVendor</div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              India's most trusted multi-vendor marketplace. Shop from thousands of products with confidence and start your own online store.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-indigo-600 rounded-full flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-400 rounded-full flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products?sale=true" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Sale & Offers
                </Link>
              </li>
              <li>
                <Link href="/products?featured=true" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Featured Products
                </Link>
              </li>
              <li>
                <Link href="/products?new=true" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products?category=electronics" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Electronics
                </Link>
              </li>
              <li>
                <Link href="/products?category=fashion" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Fashion
                </Link>
              </li>
              <li>
                <Link href="/products?category=home-kitchen" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Home & Kitchen
                </Link>
              </li>
              <li>
                <Link href="/products?category=books" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Books
                </Link>
              </li>
              <li>
                <Link href="/products?category=sports" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Sports & Fitness
                </Link>
              </li>
              <li>
                <Link href="/products?category=beauty" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Beauty & Health
                </Link>
              </li>
            </ul>
          </div>

          {/* Seller Zone */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Seller Zone</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/seller" className="text-indigo-400 hover:text-indigo-300 transition-colors font-semibold flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link href="/vendor/login" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Seller Login
                </Link>
              </li>
              <li>
                <Link href="/vendor/register" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Seller Register
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Seller Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Seller Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Seller FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/orders" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Returns & Refunds
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Payment Methods
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-gray-400">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                1800-123-4567
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                support@multivendor.com
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Mon-Sat: 9AM - 6PM
              </li>
              <li className="flex items-start gap-2 text-gray-400">
                <svg className="w-5 h-5 text-indigo-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Mumbai, Maharashtra<br />India - 400001</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 MultiVendor. All rights reserved. Made with
              <svg className="w-4 h-4 inline mx-1 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              in India
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                About Us
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                Cookie Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                Sitemap
              </a>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="text-center">
              <p className="text-gray-500 text-xs mb-3">We Accept</p>
              <div className="flex justify-center items-center gap-4 flex-wrap">
                <div className="bg-white rounded px-3 py-2 text-xs font-semibold text-gray-700">VISA</div>
                <div className="bg-white rounded px-3 py-2 text-xs font-semibold text-gray-700">Mastercard</div>
                <div className="bg-white rounded px-3 py-2 text-xs font-semibold text-gray-700">RuPay</div>
                <div className="bg-white rounded px-3 py-2 text-xs font-semibold text-gray-700">UPI</div>
                <div className="bg-white rounded px-3 py-2 text-xs font-semibold text-gray-700">Paytm</div>
                <div className="bg-white rounded px-3 py-2 text-xs font-semibold text-gray-700">PhonePe</div>
                <div className="bg-white rounded px-3 py-2 text-xs font-semibold text-gray-700">Google Pay</div>
                <div className="bg-white rounded px-3 py-2 text-xs font-semibold text-gray-700">COD</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

