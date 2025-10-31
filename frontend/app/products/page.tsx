'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { productsService, Product, Category } from '@/lib/products';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header';

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { addToCart } = useCart();

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [sortBy, setSortBy] = useState('newest');
  const [minRating, setMinRating] = useState(0);

  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    alert('Product added to cart!');
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Build params object, only include category and search if they have values
        const params: any = {
          page: currentPage,
          per_page: 12,
        };

        if (category) {
          params.category = category;
        }

        if (search) {
          params.search = search;
        }

        const [productsRes, categoriesRes] = await Promise.all([
          productsService.getProducts(params),
          productsService.getCategories(),
        ]);

        setProducts(productsRes.data.data);
        setTotalPages(productsRes.data.last_page);
        setTotal(productsRes.data.total);
        setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, category, search]);

  // Client-side filtering and sorting
  const filteredAndSortedProducts = products
    .filter(product => {
      const price = parseFloat(product.selling_price);
      const rating = parseFloat(product.rating || '0');
      return price >= priceRange[0] && price <= priceRange[1] && rating >= minRating;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return parseFloat(a.selling_price) - parseFloat(b.selling_price);
        case 'price_high':
          return parseFloat(b.selling_price) - parseFloat(a.selling_price);
        case 'rating':
          return parseFloat(b.rating || '0') - parseFloat(a.rating || '0');
        case 'popular':
          return ((b as any).sales_count || 0) - ((a as any).sales_count || 0);
        case 'newest':
        default:
          return new Date((b as any).created_at || 0).getTime() - new Date((a as any).created_at || 0).getTime();
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Loading products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  Home
                </Link>
              </li>
              <li>
                <span className="text-gray-400">/</span>
              </li>
              <li>
                <span className="text-gray-900 font-medium">Products</span>
              </li>
            </ol>
          </nav>
        </div>

        <div className="flex gap-8">
          {/* Sidebar - Filters */}
          <aside className="w-64 flex-shrink-0 space-y-6">
            {/* Categories */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📂</span>
                Categories
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/products"
                    className={`block px-3 py-2 rounded-lg transition-colors ${!category ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    All Products
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/products?category=${cat.slug}`}
                      className={`block px-3 py-2 rounded-lg transition-colors ${category === cat.slug ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Range Filter */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>💰</span>
                Price Range
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Min: ₹{priceRange[0].toLocaleString('en-IN')}</label>
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="500"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Max: ₹{priceRange[1].toLocaleString('en-IN')}</label>
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
                <div className="pt-2 border-t">
                  <div className="text-sm font-semibold text-gray-900">
                    ₹{priceRange[0].toLocaleString('en-IN')} - ₹{priceRange[1].toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>⭐</span>
                Minimum Rating
              </h3>
              <div className="space-y-2">
                {[4, 3, 2, 1, 0].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setMinRating(rating)}
                    className={`w-full px-3 py-2 rounded-lg text-left transition-colors ${
                      minRating === rating
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {rating > 0 ? (
                      <>
                        {'⭐'.repeat(rating)} & Up
                      </>
                    ) : (
                      'All Ratings'
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setPriceRange([0, 50000]);
                setMinRating(0);
                setSortBy('newest');
              }}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear All Filters
            </button>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Header with Sort */}
            <div className="mb-6 bg-white rounded-2xl shadow-md p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">
                    {search ? `Search results for "${search}"` : category ? categories.find(c => c.slug === category)?.name : 'All Products'}
                  </h1>
                  <p className="text-gray-600">{total} products found</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredAndSortedProducts.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search criteria</p>
                <button
                  onClick={() => {
                    setPriceRange([0, 50000]);
                    setMinRating(0);
                    setSortBy('newest');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg transition-all"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                  {filteredAndSortedProducts.map((product, index) => {
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
                            {product.stock_status !== 'in_stock' && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <span className="bg-red-600 text-white px-4 py-2 rounded-full font-bold">Out of Stock</span>
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
                          disabled={product.stock_status !== 'in_stock'}
                          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {product.stock_status === 'in_stock' ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                      </div>
                    </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">Loading products...</div>
        </main>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
