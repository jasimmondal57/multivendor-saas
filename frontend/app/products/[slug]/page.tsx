'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { productsService, Product } from '@/lib/products';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  const [isPinned, setIsPinned] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeChecking, setPincodeChecking] = useState(false);
  const [pincodeResult, setPincodeResult] = useState<{ available: boolean; message: string } | null>(null);
  const { addToCart } = useCart();

  // Sample product images
  const productImages = [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop',
  ];

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      alert('Product added to cart!');
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, quantity);
      router.push('/cart');
    }
  };

  const handlePincodeCheck = async () => {
    if (!pincode || pincode.length !== 6) {
      setPincodeResult({ available: false, message: 'Please enter a valid 6-digit pincode' });
      return;
    }

    setPincodeChecking(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/shipping/check-pincode/${pincode}`);
      const data = await response.json();

      if (data.success) {
        setPincodeResult({
          available: data.serviceable,
          message: data.message,
        });
      } else {
        setPincodeResult({
          available: false,
          message: data.message || 'Failed to check pincode serviceability',
        });
      }
    } catch (error) {
      console.error('Error checking pincode:', error);
      setPincodeResult({
        available: false,
        message: 'Failed to check pincode. Please try again.',
      });
    } finally {
      setPincodeChecking(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productsService.getProduct(slug);
        setProduct(response.data);

        // Fetch related products from the same category
        const relatedRes = await productsService.getProducts({
          category: response.data.category.slug,
          per_page: 8,
        });

        // Filter out current product and limit to 4
        const related = relatedRes.data.data
          .filter((p: Product) => p.slug !== slug)
          .slice(0, 4);

        setRelatedProducts(related);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // Handle scroll for sticky buy section
  useEffect(() => {
    const handleScroll = () => {
      setIsPinned(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Loading product...</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-8xl mb-6">😕</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Product not found</h1>
            <p className="text-gray-600 mb-8">The product you're looking for doesn't exist</p>
            <Link
              href="/products"
              className="inline-block px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg transition-all"
            >
              Back to Products
            </Link>
          </div>
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
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  Home
                </Link>
              </li>
              <li><span className="text-gray-400">/</span></li>
              <li>
                <Link href="/products" className="text-gray-500 hover:text-gray-700">
                  Products
                </Link>
              </li>
              <li><span className="text-gray-400">/</span></li>
              <li>
                <Link href={`/products?category=${product.category.slug}`} className="text-gray-500 hover:text-gray-700">
                  {product.category.name}
                </Link>
              </li>
              <li><span className="text-gray-400">/</span></li>
              <li><span className="text-gray-900 font-medium">{product.name}</span></li>
            </ol>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Product Images */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-50 rounded-xl mb-4 overflow-hidden group">
                <img
                  src={productImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {parseFloat(product.discount_percentage) > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    {parseFloat(product.discount_percentage).toFixed(0)}% OFF
                  </div>
                )}
                {product.is_featured && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Featured
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              <div className="grid grid-cols-4 gap-3">
                {productImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`aspect-square bg-gray-50 rounded-lg overflow-hidden cursor-pointer transition-all ${
                      selectedImage === i
                        ? 'ring-2 ring-indigo-600 ring-offset-2'
                        : 'hover:ring-2 hover:ring-gray-300'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`View ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {/* Product Title & Rating */}
              <div className="mb-4">
                <Link
                  href={`/products?category=${product.category.slug}`}
                  className="inline-block text-sm text-indigo-600 hover:text-indigo-700 font-medium mb-2"
                >
                  {product.category.name}
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h1>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-1">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">4.5</span>
                  </div>
                  <span className="text-sm text-gray-500">({product.review_count} reviews)</span>
                </div>

                <p className="text-xs text-gray-500">SKU: {product.sku}</p>
              </div>

              {/* Price Section */}
              <div className="mb-6 pb-6 border-b">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ₹{parseFloat(product.selling_price).toLocaleString('en-IN')}
                  </span>
                  {parseFloat(product.discount_percentage) > 0 && (
                    <>
                      <span className="text-lg text-gray-400 line-through">
                        ₹{parseFloat(product.mrp).toLocaleString('en-IN')}
                      </span>
                      <span className="text-sm text-green-600 font-bold bg-green-50 px-2 py-1 rounded">
                        {parseFloat(product.discount_percentage).toFixed(0)}% OFF
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500">Inclusive of all taxes</p>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.stock_status === 'in_stock' ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">In Stock</span>
                    <span className="text-sm text-gray-500">({product.stock_quantity} units available)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Pincode Delivery Checker */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h3 className="font-semibold text-gray-900">Check Delivery</h3>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Pincode"
                    value={pincode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setPincode(value);
                      setPincodeResult(null);
                    }}
                    className="flex-1 h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    maxLength={6}
                  />
                  <button
                    onClick={handlePincodeCheck}
                    disabled={pincodeChecking || pincode.length !== 6}
                    className="h-11 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm whitespace-nowrap"
                  >
                    {pincodeChecking ? 'Checking...' : 'Check'}
                  </button>
                </div>
                {pincodeResult && (
                  <div className={`mt-3 flex items-start gap-2 text-sm ${pincodeResult.available ? 'text-green-700' : 'text-red-700'}`}>
                    {pincodeResult.available ? (
                      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="font-medium">{pincodeResult.message}</span>
                  </div>
                )}
              </div>

              {/* Vendor Info */}
              <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Sold by</p>
                    <p className="font-semibold text-gray-900">{product.vendor.business_name}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">{product.vendor.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-gray-500">Seller Rating</p>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              {product.stock_status === 'in_stock' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Quantity</label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-indigo-600 hover:text-indigo-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-16 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg font-semibold text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock_quantity, q + 1))}
                      className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg hover:border-indigo-600 hover:text-indigo-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock_status !== 'in_stock'}
                  className="w-full px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={product.stock_status !== 'in_stock'}
                  className="w-full px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Buy Now
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 mb-6 pb-6 border-b">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <svg className="w-6 h-6 mx-auto mb-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-xs font-medium text-gray-700">Authentic</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <svg className="w-6 h-6 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                  <div className="text-xs font-medium text-gray-700">Fast Delivery</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <svg className="w-6 h-6 mx-auto mb-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  <div className="text-xs font-medium text-gray-700">Easy Returns</div>
                </div>
              </div>

              {/* Key Features */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Features</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>100% Authentic Product</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>GST Invoice Available</span>
                  </li>
                  {(product as any).is_returnable && (
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{(product as any).return_period_days} Days Return Policy</span>
                    </li>
                  )}
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Secure Payment Options</span>
                  </li>
                </ul>
              </div>

              {/* Product Details Summary */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Product Details</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Weight</dt>
                    <dd className="font-medium text-gray-900">{(product as any).weight || 'N/A'}g</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">HSN Code</dt>
                    <dd className="font-medium text-gray-900">{(product as any).hsn_code || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">GST</dt>
                    <dd className="font-medium text-gray-900">{product.gst_percentage}%</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt className="text-gray-600">Country of Origin</dt>
                    <dd className="font-medium text-gray-900">{(product as any).country_of_origin || 'India'}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Content Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Tab Headers */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('description')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'description'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('specifications')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'specifications'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'reviews'
                    ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Reviews ({product.review_count})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Product Description</h3>
                <p className="text-gray-700 leading-relaxed mb-4">{product.description}</p>

                <h4 className="text-lg font-semibold text-gray-900 mb-3 mt-6">Features & Benefits</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Premium quality materials ensuring long-lasting durability</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Designed for optimal performance and user satisfaction</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Backed by manufacturer warranty and quality assurance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Eco-friendly packaging and sustainable sourcing</span>
                  </li>
                </ul>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Technical Specifications</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b">
                      <span className="font-medium text-gray-700">SKU</span>
                      <span className="text-gray-900">{product.sku}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="font-medium text-gray-700">Category</span>
                      <span className="text-gray-900">{product.category.name}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="font-medium text-gray-700">Weight</span>
                      <span className="text-gray-900">{(product as any).weight || 'N/A'}g</span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="font-medium text-gray-700">Dimensions</span>
                      <span className="text-gray-900">{(product as any).length || 'N/A'} × {(product as any).width || 'N/A'} × {(product as any).height || 'N/A'} cm</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b">
                      <span className="font-medium text-gray-700">HSN Code</span>
                      <span className="text-gray-900">{(product as any).hsn_code || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="font-medium text-gray-700">GST Rate</span>
                      <span className="text-gray-900">{product.gst_percentage}%</span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="font-medium text-gray-700">Country of Origin</span>
                      <span className="text-gray-900">{(product as any).country_of_origin || 'India'}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b">
                      <span className="font-medium text-gray-700">Manufacturer</span>
                      <span className="text-gray-900">{(product as any).manufacturer || product.vendor.business_name}</span>
                    </div>
                  </div>
                </div>

                {(product as any).is_returnable && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-green-900 mb-1">Return Policy</h4>
                        <p className="text-sm text-green-700">
                          This product is eligible for return within {(product as any).return_period_days || 7} days of delivery.
                          Product must be unused and in original packaging.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Customer Reviews</h3>
                  {user && (
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                      Write a Review
                    </button>
                  )}
                </div>

                {/* Rating Summary */}
                <div className="bg-gray-50 rounded-xl p-6 mb-8">
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-gray-900 mb-2">4.5</div>
                      <div className="flex text-yellow-400 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">{product.review_count} reviews</div>
                    </div>
                    <div className="flex-1 space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 w-12">{rating} star</span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400"
                              style={{ width: `${rating === 5 ? 70 : rating === 4 ? 20 : rating === 3 ? 5 : rating === 2 ? 3 : 2}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">
                            {rating === 5 ? 70 : rating === 4 ? 20 : rating === 3 ? 5 : rating === 2 ? 3 : 2}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sample Reviews */}
                <div className="space-y-6">
                  {[1, 2, 3].map((review) => (
                    <div key={review} className="border-b border-gray-200 pb-6 last:border-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">John Doe</span>
                            <span className="text-sm text-gray-500">• 2 days ago</span>
                          </div>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          Verified Purchase
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">Excellent product!</h4>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        Great quality and exactly as described. Fast delivery and well packaged.
                        Highly recommend this product to anyone looking for quality and value.
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <button className="text-sm text-gray-600 hover:text-indigo-600 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          Helpful (12)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {product.review_count === 0 && (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                    <p className="text-gray-600 mb-4">Be the first to review this product</p>
                    {user && (
                      <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        Write a Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">You May Also Like</h2>
              <Link
                href={`/products?category=${product.category.slug}`}
                className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1"
              >
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.slug}`}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all group"
                >
                  <div className="aspect-square bg-gray-100 overflow-hidden relative">
                    <img
                      src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop"
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {parseFloat(relatedProduct.discount_percentage) > 0 && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        {parseFloat(relatedProduct.discount_percentage).toFixed(0)}% OFF
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">({relatedProduct.review_count})</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        ₹{parseFloat(relatedProduct.selling_price).toLocaleString('en-IN')}
                      </span>
                      {parseFloat(relatedProduct.discount_percentage) > 0 && (
                        <span className="text-xs text-gray-400 line-through">
                          ₹{parseFloat(relatedProduct.mrp).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Bar (Mobile) */}
      {isPinned && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-40 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-sm text-gray-600">Price</div>
              <div className="text-xl font-bold text-gray-900">
                ₹{parseFloat(product.selling_price).toLocaleString('en-IN')}
              </div>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock_status !== 'in_stock'}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg disabled:opacity-50"
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock_status !== 'in_stock'}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-lg disabled:opacity-50"
            >
              Buy Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

