'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/lib/admin';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportsAnalyticsProps {
  activeSubTab: string;
}

export default function ReportsAnalytics({ activeSubTab }: ReportsAnalyticsProps) {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    if (activeSubTab === 'reports') {
      fetchReports('sales');
    } else if (activeSubTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeSubTab, dateRange, period]);

  const fetchReports = async (type: string) => {
    setLoading(true);
    try {
      const response = await adminService.getReports({
        type,
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
      });
      if (response.success) {
        setReportData({ ...response.data, type });
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAnalytics(period);
      if (response.success) {
        setAnalyticsData(response.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  if (activeSubTab === 'reports') {
    return (
      <div className="space-y-6">
        {/* Report Type Selector */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h3 className="text-xl font-bold text-gray-900">Reports Dashboard</h3>
            
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="date"
                value={dateRange.start_date}
                onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { type: 'sales', label: 'Sales Report', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z', color: 'blue' },
              { type: 'revenue', label: 'Revenue Report', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'green' },
              { type: 'customers', label: 'Customer Report', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'purple' },
              { type: 'vendors', label: 'Vendor Report', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'orange' },
              { type: 'inventory', label: 'Inventory Report', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', color: 'teal' },
            ].map((report) => (
              <button
                key={report.type}
                onClick={() => fetchReports(report.type)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  reportData?.type === report.type
                    ? `border-${report.color}-500 bg-${report.color}-50`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <svg className={`w-6 h-6 mx-auto mb-2 text-${report.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={report.icon} />
                </svg>
                <div className="text-sm font-medium text-gray-900">{report.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Report Content */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading report data...</p>
          </div>
        ) : reportData ? (
          <div className="space-y-6">
            {/* Sales Report */}
            {reportData.type === 'sales' && reportData.summary && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm opacity-90">Total Orders</div>
                      <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div className="text-3xl font-bold">{reportData.summary.total_orders || 0}</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm opacity-90">Total Revenue</div>
                      <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-3xl font-bold">₹{parseFloat(reportData.summary.total_revenue || 0).toLocaleString('en-IN')}</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm opacity-90">Avg Order Value</div>
                      <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-3xl font-bold">₹{parseFloat(reportData.summary.average_order_value || 0).toLocaleString('en-IN')}</div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm opacity-90">Items Sold</div>
                      <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="text-3xl font-bold">{reportData.summary.total_items_sold || 0}</div>
                  </div>
                </div>

                {/* Daily Sales Chart */}
                {reportData.daily_sales && reportData.daily_sales.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Daily Sales Trend</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={reportData.daily_sales}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Revenue (₹)" />
                        <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2} name="Orders" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Top Products */}
                {reportData.top_products && reportData.top_products.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Top Selling Products</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">SKU</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Units Sold</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.top_products.map((product: any, index: number) => (
                            <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                    {index + 1}
                                  </div>
                                  <span className="font-medium text-gray-900">{product.name}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">{product.sku}</td>
                              <td className="py-3 px-4 text-right font-semibold text-gray-900">{product.total_sold}</td>
                              <td className="py-3 px-4 text-right font-semibold text-green-600">
                                ₹{parseFloat(product.total_revenue).toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Revenue Report */}
            {reportData.type === 'revenue' && (
              <>
                {/* Revenue by Vendor */}
                {reportData.by_vendor && reportData.by_vendor.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Revenue by Vendor</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Vendor</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Orders</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Revenue</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.by_vendor.map((vendor: any) => (
                            <tr key={vendor.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium text-gray-900">{vendor.name || vendor.business_name}</td>
                              <td className="py-3 px-4 text-right text-gray-600">{vendor.total_orders}</td>
                              <td className="py-3 px-4 text-right font-semibold text-green-600">
                                ₹{parseFloat(vendor.total_revenue).toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Revenue by Category */}
                {reportData.by_category && reportData.by_category.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Revenue by Category</h4>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={reportData.by_category}
                            dataKey="total_revenue"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            label
                          >
                            {reportData.by_category.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-4">Category Performance</h4>
                      <div className="space-y-3">
                        {reportData.by_category.map((category: any, index: number) => (
                          <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                              <span className="font-medium text-gray-900">{category.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-green-600">₹{parseFloat(category.total_revenue).toLocaleString('en-IN')}</div>
                              <div className="text-xs text-gray-500">{category.total_sold} units</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Customer Report */}
            {reportData.type === 'customers' && reportData.summary && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm opacity-90">Total Customers</div>
                      <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="text-3xl font-bold">{reportData.summary.total_customers || 0}</div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm opacity-90">New Customers</div>
                      <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                    <div className="text-3xl font-bold">{reportData.summary.new_customers || 0}</div>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm opacity-90">Active Customers</div>
                      <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-3xl font-bold">{reportData.summary.active_customers || 0}</div>
                  </div>
                </div>

                {/* Top Customers */}
                {reportData.top_customers && reportData.top_customers.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Top Customers</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Orders</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Spent</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.top_customers.map((customer: any, index: number) => (
                            <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">
                                    {index + 1}
                                  </div>
                                  <span className="font-medium text-gray-900">{customer.name}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">{customer.email}</td>
                              <td className="py-3 px-4 text-right font-semibold text-gray-900">{customer.total_orders}</td>
                              <td className="py-3 px-4 text-right font-semibold text-green-600">
                                ₹{parseFloat(customer.total_spent).toLocaleString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Vendor Report */}
            {reportData.type === 'vendors' && reportData.vendors && reportData.vendors.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Vendor Performance</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Vendor</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Products</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Active</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Orders</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Revenue</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.vendors.map((vendor: any) => (
                        <tr key={vendor.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{vendor.user?.name || vendor.business_name}</div>
                              <div className="text-xs text-gray-500">{vendor.business_email}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right text-gray-600">{vendor.products_count || 0}</td>
                          <td className="py-3 px-4 text-right text-gray-600">{vendor.active_products_count || 0}</td>
                          <td className="py-3 px-4 text-right font-semibold text-gray-900">{vendor.period_orders || 0}</td>
                          <td className="py-3 px-4 text-right font-semibold text-green-600">
                            ₹{parseFloat(vendor.period_revenue || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              vendor.status === 'active' ? 'bg-green-100 text-green-700' :
                              vendor.status === 'suspended' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {vendor.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Inventory Report */}
            {reportData.type === 'inventory' && reportData.summary && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm opacity-90">Total Products</div>
                      <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="text-3xl font-bold">{reportData.summary.total_products || 0}</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm opacity-90">Active Products</div>
                      <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-3xl font-bold">{reportData.summary.active_products || 0}</div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm opacity-90">Low Stock</div>
                      <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="text-3xl font-bold">{reportData.summary.low_stock_products || 0}</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm opacity-90">Out of Stock</div>
                      <svg className="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div className="text-3xl font-bold">{reportData.summary.out_of_stock_products || 0}</div>
                  </div>
                </div>

                {/* Low Stock Products */}
                {reportData.low_stock && reportData.low_stock.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Low Stock Alert</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Vendor</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Current Stock</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Threshold</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.low_stock.map((product: any) => (
                            <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div className="font-medium text-gray-900">{product.name}</div>
                                <div className="text-xs text-gray-500">{product.sku}</div>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">{product.vendor?.user?.name || 'N/A'}</td>
                              <td className="py-3 px-4 text-right">
                                <span className={`font-semibold ${
                                  product.stock_quantity === 0 ? 'text-red-600' :
                                  product.stock_quantity <= 5 ? 'text-yellow-600' :
                                  'text-gray-900'
                                }`}>
                                  {product.stock_quantity}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right text-gray-600">{product.low_stock_threshold || 10}</td>
                              <td className="py-3 px-4 text-center">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  product.stock_quantity === 0 ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {product.stock_quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">Select a Report Type</h4>
            <p className="text-gray-600">Choose a report type above to view detailed analytics</p>
          </div>
        )}
      </div>
    );
  }

  // Analytics Tab
  if (activeSubTab === 'analytics') {
    return (
      <div className="space-y-6">
        {/* Period Selector */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Analytics Dashboard</h3>
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium"
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
              <option value={365}>Last Year</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading analytics data...</p>
          </div>
        ) : analyticsData ? (
          <>
            {/* Revenue Chart */}
            {analyticsData.revenue_chart && analyticsData.revenue_chart.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Revenue & Orders Trend</h4>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={analyticsData.revenue_chart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenue" fill="#10B981" name="Revenue (₹)" />
                    <Bar yAxisId="right" dataKey="orders" fill="#3B82F6" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top Products & Vendors */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Products */}
              {analyticsData.top_products && analyticsData.top_products.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Top Products</h4>
                  <div className="space-y-3">
                    {analyticsData.top_products.slice(0, 5).map((product: any, index: number) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-500">{product.sku}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-blue-600">{product.sales_count} sales</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Vendors */}
              {analyticsData.top_vendors && analyticsData.top_vendors.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Top Vendors</h4>
                  <div className="space-y-3">
                    {analyticsData.top_vendors.slice(0, 5).map((vendor: any, index: number) => (
                      <div key={vendor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{vendor.user?.name || vendor.business_name}</div>
                            <div className="text-xs text-gray-500">{vendor.business_email}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">₹{parseFloat(vendor.total_revenue).toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h4 className="text-lg font-semibold text-gray-700 mb-2">No Analytics Data</h4>
            <p className="text-gray-600">Analytics data will appear here once you have orders</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}

