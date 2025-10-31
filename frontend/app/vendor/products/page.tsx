'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { getProductImage } from '@/lib/images';

export default function VendorProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock products data - replace with real API call
  const products = [
    { id: 1, name: 'Wireless Headphones', category: 'Electronics', price: 2999, stock: 45, status: 'active', sales: 145 },
    { id: 2, name: 'Smart Watch', category: 'Electronics', price: 4999, stock: 23, status: 'active', sales: 98 },
    { id: 3, name: 'Bluetooth Speaker', category: 'Electronics', price: 1999, stock: 67, status: 'active', sales: 76 },
    { id: 4, name: 'Phone Case', category: 'Accessories', price: 499, stock: 0, status: 'out_of_stock', sales: 234 },
    { id: 5, name: 'Laptop Bag', category: 'Accessories', price: 1499, stock: 12, status: 'active', sales: 56 },
    { id: 6, name: 'USB Cable', category: 'Electronics', price: 299, stock: 156, status: 'active', sales: 312 },
    { id: 7, name: 'Power Bank', category: 'Electronics', price: 1799, stock: 34, status: 'pending', sales: 89 },
    { id: 8, name: 'Screen Protector', category: 'Accessories', price: 199, stock: 89, status: 'active', sales: 445 },
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || product.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Products</h1>
            <p className="text-gray-600">Manage your product catalog</p>
          </div>
          <Link
            href="/vendor/products/new"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg transition-all"
          >
            <span className="text-xl">+</span>
            Add New Product
          </Link>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
              <input
                type="text"
                placeholder="Search by product name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Products</option>
                <option value="active">Active</option>
                <option value="pending">Pending Approval</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden group">
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                <img
                  src={getProductImage(index, 'medium')}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    product.status === 'active' ? 'bg-green-500 text-white' :
                    product.status === 'pending' ? 'bg-yellow-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    {product.status === 'active' ? 'Active' :
                     product.status === 'pending' ? 'Pending' :
                     'Out of Stock'}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs text-indigo-600 font-semibold mb-1">{product.category}</p>
                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between mb-4 text-sm">
                  <span className="text-gray-600">Stock: <span className="font-semibold">{product.stock}</span></span>
                  <span className="text-gray-600">Sales: <span className="font-semibold">{product.sales}</span></span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/vendor/products/${product.id}/edit`}
                    className="flex-1 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors text-center"
                  >
                    Edit
                  </Link>
                  <button
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    ⋮
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
            <Link
              href="/vendor/products/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg transition-all"
            >
              <span className="text-xl">+</span>
              Add Your First Product
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

