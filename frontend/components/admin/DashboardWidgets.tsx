'use client';

import { Order, Product, Vendor } from '@/lib/admin';

interface DashboardWidgetsProps {
  recentOrders?: Order[];
  topProducts?: Product[];
  lowStockProducts?: Product[];
  topVendors?: Vendor[];
}

export default function DashboardWidgets({
  recentOrders = [],
  topProducts = [],
  lowStockProducts = [],
  topVendors = [],
}: DashboardWidgetsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Orders Widget */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div className="space-y-3">
          {recentOrders.length > 0 ? (
            recentOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">#{order.order_number}</p>
                  <p className="text-sm text-gray-600">{order.customer?.name || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{(order.total_amount || 0).toLocaleString('en-IN')}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">No recent orders</p>
          )}
        </div>
      </div>

      {/* Top Selling Products Widget */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Top Selling Products</h3>
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div className="space-y-3">
          {topProducts.length > 0 ? (
            topProducts.slice(0, 5).map((product, index) => (
              <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-sm text-gray-600">Stock: {product.stock_quantity || 0}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{(product.selling_price || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">No product data</p>
          )}
        </div>
      </div>

      {/* Low Stock Alerts Widget */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Low Stock Alerts</h3>
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="space-y-3">
          {lowStockProducts.length > 0 ? (
            lowStockProducts.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">{product.vendor?.business_name || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">{product.stock_quantity || 0}</p>
                  <p className="text-xs text-gray-500">units left</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">No low stock items</p>
          )}
        </div>
      </div>

      {/* Top Performing Vendors Widget */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Top Performing Vendors</h3>
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div className="space-y-3">
          {topVendors.length > 0 ? (
            topVendors.slice(0, 5).map((vendor, index) => (
              <div key={vendor.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{vendor.business_name}</p>
                  <p className="text-sm text-gray-600">{vendor.user?.email || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    vendor.status === 'active' ? 'bg-green-100 text-green-700' :
                    vendor.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {vendor.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">No vendor data</p>
          )}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-100">Today's Orders</p>
            <svg className="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-3xl font-bold">{recentOrders.filter(o => {
            const today = new Date().toDateString();
            return new Date(o.created_at).toDateString() === today;
          }).length}</p>
          <p className="text-sm text-blue-100 mt-1">+12% from yesterday</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-100">Today's Revenue</p>
            <svg className="w-6 h-6 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold">₹{recentOrders.filter(o => {
            const today = new Date().toDateString();
            return new Date(o.created_at).toDateString() === today;
          }).reduce((sum, o) => sum + (o.total_amount || 0), 0).toLocaleString('en-IN')}</p>
          <p className="text-sm text-green-100 mt-1">+8% from yesterday</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-purple-100">Active Vendors</p>
            <svg className="w-6 h-6 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-3xl font-bold">{topVendors.filter(v => v.status === 'active').length}</p>
          <p className="text-sm text-purple-100 mt-1">Total: {topVendors.length}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-orange-100">Low Stock Items</p>
            <svg className="w-6 h-6 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-3xl font-bold">{lowStockProducts.length}</p>
          <p className="text-sm text-orange-100 mt-1">Requires attention</p>
        </div>
      </div>
    </div>
  );
}

