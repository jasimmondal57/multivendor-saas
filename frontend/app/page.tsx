'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { productsService, Product, Category } from '@/lib/products';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productsService.getFeaturedProducts(),
          productsService.getCategories(),
        ]);
        setFeaturedProducts(productsRes.data);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    // Show toast notification (you can add a toast library later)
    alert('Product added to cart!');
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Loading amazing products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6 animate-fade-in">
              <span className="block bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
                India's Most Trusted
              </span>
              <span className="block mt-2">
                Marketplace
              </span>
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-xl md:text-2xl text-indigo-100 animate-fade-in-delay">
              Discover 10,000+ products from verified sellers. Best prices, fast delivery, and 100% authentic products guaranteed.
            </p>
            <div className="mt-10 flex justify-center animate-fade-in-delay-2">
              <Link
                href="/products"
                className="px-10 py-4 bg-white text-indigo-600 text-lg font-bold rounded-full hover:bg-gray-100 shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Start Shopping
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold">10K+</div>
                <div className="text-indigo-200 mt-1">Products</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">500+</div>
                <div className="text-indigo-200 mt-1">Vendors</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">50K+</div>
                <div className="text-indigo-200 mt-1">Customers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">4.8★</div>
                <div className="text-indigo-200 mt-1">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Categories */}
        {categories.length > 0 && (
          <section className="mb-20">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Shop by Category
              </h2>
              <p className="text-gray-600">Explore our wide range of product categories</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {categories.map((category, index) => {
                const categoryImages = [
                  'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=400&fit=crop', // Electronics
                  'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop', // Fashion
                  'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&h=400&fit=crop', // Home & Kitchen
                  'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=400&fit=crop', // Books
                  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=400&fit=crop', // Sports
                ];
                const gradients = [
                  'from-blue-500 to-cyan-500',
                  'from-pink-500 to-rose-500',
                  'from-green-500 to-emerald-500',
                  'from-orange-500 to-amber-500',
                  'from-purple-500 to-violet-500',
                ];
                return (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.slug}`}
                    className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradients[index % 5]} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={categoryImages[index % 5]}
                        alt={category.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="font-bold text-gray-900 text-lg">{category.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">Explore →</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section className="mb-20">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <svg className="w-10 h-10 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  Featured Products
                </h2>
                <p className="text-gray-600">Handpicked products just for you</p>
              </div>
              <Link
                href="/products"
                className="hidden md:flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors"
              >
                View All
                <span>→</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product, index) => {
                // Sample product images from Unsplash
                const productImages = [
                  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop', // Headphones
                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop', // Watch
                  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop', // Sunglasses
                  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&h=500&fit=crop', // Smartwatch
                  'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&h=500&fit=crop', // Sneakers
                  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&h=500&fit=crop', // Sneakers 2
                  'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=500&h=500&fit=crop', // Perfume
                  'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500&h=500&fit=crop', // Camera
                  'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500&h=500&fit=crop', // Laptop
                  'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop', // Phone
                ];
                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
                  >
                    <Link href={`/products/${product.slug}`}>
                      <div className="relative aspect-square bg-gray-100 overflow-hidden">
                        <img
                          src={productImages[index % productImages.length]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {parseFloat(product.discount_percentage) > 0 && (
                          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            {parseFloat(product.discount_percentage).toFixed(0)}% OFF
                          </div>
                        )}
                      </div>
                    </Link>
                  <div className="p-5">
                    <Link href={`/products/${product.slug}`}>
                      <p className="text-xs text-indigo-600 font-semibold mb-1">{product.category.name}</p>
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{parseFloat(product.selling_price).toLocaleString('en-IN')}
                      </span>
                      {parseFloat(product.discount_percentage) > 0 && (
                        <span className="text-sm text-gray-400 line-through">
                          ₹{parseFloat(product.mrp).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">★★★★★</span>
                        <span className="text-sm text-gray-600 ml-1">4.5</span>
                      </div>
                      <span className="text-xs text-gray-500">{product.vendor.business_name}</span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
            <div className="text-center mt-10 md:hidden">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 transition-colors"
              >
                View All Products
                <span>→</span>
              </Link>
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center transform hover:-translate-y-2 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">100% Authentic</h3>
              <p className="text-gray-600">All products verified and guaranteed authentic</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center transform hover:-translate-y-2 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Quick delivery with reliable logistics partners</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center transform hover:-translate-y-2 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Payments</h3>
              <p className="text-gray-600">Bank-level security and encryption</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center transform hover:-translate-y-2 transition-all">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Easy Returns</h3>
              <p className="text-gray-600">7-day return policy on all products</p>
            </div>
          </div>
        </section>

        {/* Deals Section */}
        <section className="mb-20">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-12 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                  <div className="inline-block bg-white text-orange-600 px-4 py-2 rounded-full font-bold text-sm mb-4">
                    LIMITED TIME OFFER
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-4">
                    Mega Sale!
                  </h2>
                  <p className="text-xl text-orange-100 mb-6">
                    Up to 70% OFF on selected products. Hurry, offer ends soon!
                  </p>
                  <Link
                    href="/products?sale=true"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 font-bold text-lg rounded-full hover:bg-gray-100 shadow-xl transform hover:scale-105 transition-all"
                  >
                    Shop Now
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
                <div className="flex-shrink-0">
                  <div className="text-center bg-white text-orange-600 rounded-2xl p-8 shadow-2xl">
                    <div className="text-6xl font-bold">70%</div>
                    <div className="text-2xl font-semibold">OFF</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              What Our Customers Say
            </h2>
            <p className="text-gray-600">Trusted by thousands of happy customers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 transform hover:-translate-y-2 transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "Amazing shopping experience! Fast delivery and authentic products. Highly recommended!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  RK
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Rahul Kumar</div>
                  <div className="text-sm text-gray-500">Mumbai</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 transform hover:-translate-y-2 transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "Best prices and great quality. The customer service is excellent. Will shop again!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white font-bold">
                  PS
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Priya Sharma</div>
                  <div className="text-sm text-gray-500">Delhi</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 transform hover:-translate-y-2 transition-all">
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "Secure payments and hassle-free returns. This is my go-to marketplace now!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                  AM
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Amit Mehta</div>
                  <div className="text-sm text-gray-500">Bangalore</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Component */}
      <Footer />
    </div>
  );
}
