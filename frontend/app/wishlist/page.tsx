'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { useCart } from '@/contexts/CartContext';

interface WishlistItem {
  id: number;
  product: {
    id: number;
    name: string;
    slug: string;
    price: string;
    images: Array<{ image_url: string }>;
    vendor: {
      business_name: string;
    };
    stock_quantity: number;
  };
}

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchWishlist();
    }
  }, [user, authLoading, router]);

  const fetchWishlist = async () => {
    try {
      const response = await api.get('/v1/customer/wishlist');
      setWishlist(response.data.data || []);
    } catch (error: any) {
      console.error('Error fetching wishlist:', error);
      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: number) => {
    try {
      await api.delete(`/v1/customer/wishlist/${productId}`);
      setWishlist(wishlist.filter(item => item.product.id !== productId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const moveToCart = (item: WishlistItem) => {
    addToCart(item.product as any, 1);
    removeFromWishlist(item.product.id);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">{wishlist.length} items saved for later</p>
        </div>

        {/* Wishlist Items */}
        {wishlist.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">❤️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h3>
            <p className="text-gray-600 mb-6">Save items you love for later</p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
                {/* Product Image */}
                <Link href={`/products/${item.product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={item.product.images[0]?.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop'}
                    alt={item.product.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeFromWishlist(item.product.id);
                    }}
                    className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </Link>

                {/* Product Info */}
                <div className="p-4">
                  <Link href={`/products/${item.product.slug}`}>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-indigo-600 transition-colors">
                      {item.product.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 mb-2">{item.product.vendor.business_name}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{parseFloat(item.product.price).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {item.product.stock_quantity > 0 ? (
                      <button
                        onClick={() => moveToCart(item)}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
                      >
                        Out of Stock
                      </button>
                    )}
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

