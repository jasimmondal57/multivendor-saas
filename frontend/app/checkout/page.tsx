'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import api from '@/lib/api';

interface SavedAddress {
  id: number;
  type: string;
  name: string;
  phone: string;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  landmark: string | null;
  is_default: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, getGST, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true); // Pre-selected by default
  const [addressType, setAddressType] = useState<'home' | 'work' | 'other'>('home');

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'cod',
  });

  // Indian states list
  const indianStates = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal',
    'Andaman and Nicobar Islands',
    'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi',
    'Jammu and Kashmir',
    'Ladakh',
    'Lakshadweep',
    'Puducherry',
  ];

  useEffect(() => {
    if (user) {
      fetchSavedAddresses();
    }
  }, [user]);

  const fetchSavedAddresses = async () => {
    try {
      const response = await api.get('/v1/customer/addresses');
      const addresses = response.data.data || [];
      setSavedAddresses(addresses);

      // Auto-select default address if exists
      const defaultAddress = addresses.find((addr: SavedAddress) => addr.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (addresses.length > 0) {
        setUseNewAddress(true);
      } else {
        setUseNewAddress(true);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setUseNewAddress(true);
    }
  };

  const handleAddressSelect = (addressId: number) => {
    setSelectedAddressId(addressId);
    setUseNewAddress(false);

    // Fill form with selected address
    const address = savedAddresses.find(addr => addr.id === addressId);
    if (address) {
      setFormData({
        ...formData,
        fullName: address.name,
        phone: address.phone,
        address: address.address_line_1,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare order data
      const orderData: any = {
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        shipping_name: formData.fullName,
        shipping_phone: formData.phone,
        shipping_email: formData.email,
        shipping_address: formData.address,
        shipping_city: formData.city,
        shipping_state: formData.state,
        shipping_pincode: formData.pincode,
        payment_method: formData.paymentMethod,
        customer_notes: '',
      };

      // Add address_id if using saved address
      if (selectedAddressId && !useNewAddress) {
        orderData.address_id = selectedAddressId;
      }

      // Add save_address flag if user wants to save new address
      if (useNewAddress && saveAddress) {
        orderData.save_address = true;
        orderData.address_type = addressType;
      }

      const response = await api.post('/v1/customer/orders', orderData);

      if (response.data.success) {
        clearCart();
        router.push(`/order-success?order=${response.data.data.order_number}`);
      }
    } catch (error: any) {
      console.error('Order creation error:', error);
      alert(error.response?.data?.message || 'Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="mb-6 flex justify-center">
            <svg className="w-32 h-32 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Please Login to Continue</h1>
          <p className="text-gray-600 mb-8">You need to be logged in to place an order</p>
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg transition-all"
          >
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="mb-6 flex justify-center">
            <svg className="w-32 h-32 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Add some products to your cart before checkout</p>
          <Link
            href="/products"
            className="inline-block px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link></li>
            <li><span className="text-gray-400">/</span></li>
            <li><Link href="/cart" className="text-gray-500 hover:text-gray-700">Cart</Link></li>
            <li><span className="text-gray-400">/</span></li>
            <li><span className="text-gray-900 font-medium">Checkout</span></li>
          </ol>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Delivery Address */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h2 className="text-xl font-bold text-gray-900">Delivery Address</h2>
                </div>

                {/* Saved Addresses */}
                {savedAddresses.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-700">Saved Addresses</h3>
                      <button
                        type="button"
                        onClick={() => setUseNewAddress(!useNewAddress)}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        {useNewAddress ? 'Use Saved Address' : '+ Add New Address'}
                      </button>
                    </div>

                    {!useNewAddress && (
                      <div className="grid gap-3 mb-4">
                        {savedAddresses.map((address) => (
                          <label
                            key={address.id}
                            className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              selectedAddressId === address.id
                                ? 'border-indigo-600 bg-indigo-50'
                                : 'border-gray-200 hover:border-indigo-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="savedAddress"
                              checked={selectedAddressId === address.id}
                              onChange={() => handleAddressSelect(address.id)}
                              className="mt-1 mr-3"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">{address.name}</span>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${
                                  address.type === 'home' ? 'bg-green-100 text-green-800' :
                                  address.type === 'work' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {address.type}
                                </span>
                                {address.is_default && (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-indigo-600 text-white rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{address.phone}</p>
                              <p className="text-sm text-gray-600">
                                {address.address_line_1}
                                {address.address_line_2 && `, ${address.address_line_2}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                {address.city}, {address.state} - {address.pincode}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Address Form */}
                {(useNewAddress || savedAddresses.length === 0) && (
                  <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    >
                      <option value="">Select State</option>
                      {indianStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                      pattern="[0-9]{6}"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  {/* Save Address Option */}
                  {useNewAddress && (
                    <div className="md:col-span-2 mt-4 p-4 bg-gray-50 rounded-lg">
                      <label className="flex items-start cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveAddress}
                          onChange={(e) => setSaveAddress(e.target.checked)}
                          className="mt-1 mr-3 w-4 h-4 text-indigo-600 rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Save this address for future orders</p>
                          <p className="text-sm text-gray-500">You can manage saved addresses in your dashboard</p>
                        </div>
                      </label>

                      {saveAddress && (
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
                          <div className="flex gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="addressType"
                                value="home"
                                checked={addressType === 'home'}
                                onChange={(e) => setAddressType(e.target.value as 'home' | 'work' | 'other')}
                              />
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                              </svg>
                              <span className="text-sm">Home</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="addressType"
                                value="work"
                                checked={addressType === 'work'}
                                onChange={(e) => setAddressType(e.target.value as 'home' | 'work' | 'other')}
                              />
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span className="text-sm">Work</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="addressType"
                                value="other"
                                checked={addressType === 'other'}
                                onChange={(e) => setAddressType(e.target.value as 'home' | 'work' | 'other')}
                              />
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="text-sm">Other</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                </>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-6">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleChange}
                      className="w-5 h-5 text-indigo-600"
                    />
                    <span className="ml-3 font-medium">Cash on Delivery (COD)</span>
                  </label>
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={formData.paymentMethod === 'upi'}
                      onChange={handleChange}
                      className="w-5 h-5 text-indigo-600"
                    />
                    <span className="ml-3 font-medium">UPI / Net Banking</span>
                  </label>
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-indigo-500 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={handleChange}
                      className="w-5 h-5 text-indigo-600"
                    />
                    <span className="ml-3 font-medium">Credit / Debit Card</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item, index) => {
                  const productImages = [
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop',
                    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100&h=100&fit=crop',
                    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=100&h=100&fit=crop',
                    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=100&h=100&fit=crop',
                  ];
                  return (
                    <div key={item.product.id} className="flex gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={productImages[index % productImages.length]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{item.product.name}</h3>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-gray-900">₹{(parseFloat(item.product.selling_price) * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t pt-4 space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{getSubtotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>GST</span>
                  <span className="font-semibold">₹{getGST().toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    ₹{getTotal().toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

