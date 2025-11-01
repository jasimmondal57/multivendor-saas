'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import ImageUpload from '@/components/ImageUpload';
import api from '@/lib/api';

interface CategoryAttribute {
  id: number;
  name: string;
  slug: string;
  input_type: 'text' | 'number' | 'textarea' | 'select' | 'multi_select' | 'color' | 'date';
  options: string[] | null;
  is_required: boolean;
  is_filterable: boolean;
  is_variant: boolean;
  help_text: string | null;
  sort_order: number;
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttribute[]>([]);
  const [productAttributes, setProductAttributes] = useState<Record<number, any>>({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    mrp: '',
    selling_price: '',
    stock: '',
    sku: '',
    brand: '',
    hsn_code: '',
    gst_percentage: '18',
    specifications: '',
  });

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/v1/categories');
        if (response.data.success) {
          setCategories(response.data.data.data || response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const fetchCategoryAttributes = async (categoryId: number) => {
    try {
      const response = await api.get(`/v1/vendor/categories/${categoryId}/attributes`);
      if (response.data.success) {
        setCategoryAttributes(response.data.data || []);
        // Initialize product attributes with empty values
        const initialAttributes: Record<number, any> = {};
        response.data.data.forEach((attr: CategoryAttribute) => {
          initialAttributes[attr.id] = attr.input_type === 'multi_select' ? [] : '';
        });
        setProductAttributes(initialAttributes);
      }
    } catch (error) {
      console.error('Failed to fetch category attributes:', error);
      setCategoryAttributes([]);
      setProductAttributes({});
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    setFormData({ ...formData, category_id: categoryId });

    if (categoryId) {
      await fetchCategoryAttributes(parseInt(categoryId));
    } else {
      setCategoryAttributes([]);
      setProductAttributes({});
    }
  };

  const handleAttributeChange = (attributeId: number, value: any) => {
    setProductAttributes(prev => ({
      ...prev,
      [attributeId]: value,
    }));
  };

  const handleImageUpload = (imageUrl: string | string[]) => {
    if (Array.isArray(imageUrl)) {
      setProductImages([...productImages, ...imageUrl]);
    } else {
      setProductImages([...productImages, imageUrl]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (productImages.length === 0) {
      alert('Please upload at least one product image');
      return;
    }

    if (!formData.category_id) {
      alert('Please select a category');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        category_id: parseInt(formData.category_id),
        mrp: parseFloat(formData.mrp),
        selling_price: parseFloat(formData.selling_price),
        stock_quantity: parseInt(formData.stock),
        sku: formData.sku || undefined,
        brand: formData.brand || undefined,
        hsn_code: formData.hsn_code,
        gst_percentage: parseFloat(formData.gst_percentage),
        specifications: formData.specifications || undefined,
        images: productImages,
        attributes: productAttributes,
      };

      const response = await api.post('/v1/vendor/products', payload);

      if (response.data.success) {
        alert('Product created successfully! Pending admin approval.');
        router.push('/vendor/dashboard');
      }
    } catch (error: any) {
      console.error('Error creating product:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create product';
      const errors = error.response?.data?.errors;

      if (errors) {
        const errorDetails = Object.entries(errors)
          .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        alert(`Validation errors:\n${errorDetails}`);
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link href="/vendor/dashboard" className="text-gray-500 hover:text-gray-700">Dashboard</Link></li>
            <li><span className="text-gray-400">/</span></li>
            <li><Link href="/vendor/products" className="text-gray-500 hover:text-gray-700">Products</Link></li>
            <li><span className="text-gray-400">/</span></li>
            <li><span className="text-gray-900 font-medium">Add New Product</span></li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Product</h1>
          <p className="text-gray-600">Fill in the details to list a new product</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Images */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Product Images</h2>
            <ImageUpload
              multiple={true}
              maxFiles={5}
              onUploadSuccess={handleImageUpload}
              onUploadError={(error) => alert(error)}
            />
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter product name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Describe your product..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleCategoryChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Brand name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Product SKU"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Available stock"
                />
              </div>
            </div>
          </div>

          {/* Category-Specific Attributes */}
          {categoryAttributes.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Product Attributes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categoryAttributes.map((attr) => (
                  <div key={attr.id} className={attr.input_type === 'textarea' ? 'md:col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {attr.name} {attr.is_required && <span className="text-red-500">*</span>}
                    </label>

                    {attr.input_type === 'text' && (
                      <input
                        type="text"
                        required={attr.is_required}
                        value={productAttributes[attr.id] || ''}
                        onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder={`Enter ${attr.name.toLowerCase()}`}
                      />
                    )}

                    {attr.input_type === 'number' && (
                      <input
                        type="number"
                        required={attr.is_required}
                        value={productAttributes[attr.id] || ''}
                        onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder={`Enter ${attr.name.toLowerCase()}`}
                      />
                    )}

                    {attr.input_type === 'textarea' && (
                      <textarea
                        required={attr.is_required}
                        value={productAttributes[attr.id] || ''}
                        onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder={`Enter ${attr.name.toLowerCase()}`}
                      />
                    )}

                    {attr.input_type === 'select' && attr.options && (
                      <select
                        required={attr.is_required}
                        value={productAttributes[attr.id] || ''}
                        onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">Select {attr.name.toLowerCase()}</option>
                        {attr.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}

                    {attr.input_type === 'multi_select' && attr.options && (
                      <select
                        multiple
                        required={attr.is_required}
                        value={productAttributes[attr.id] || []}
                        onChange={(e) => {
                          const values = Array.from(e.target.selectedOptions, option => option.value);
                          handleAttributeChange(attr.id, values);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        size={Math.min(attr.options.length, 5)}
                      >
                        {attr.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}

                    {attr.input_type === 'color' && (
                      <input
                        type="color"
                        required={attr.is_required}
                        value={productAttributes[attr.id] || '#000000'}
                        onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                        className="w-full h-12 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    )}

                    {attr.input_type === 'date' && (
                      <input
                        type="date"
                        required={attr.is_required}
                        value={productAttributes[attr.id] || ''}
                        onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    )}

                    {attr.help_text && (
                      <p className="text-xs text-gray-500 mt-1">{attr.help_text}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Pricing</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MRP (Maximum Retail Price) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    name="mrp"
                    value={formData.mrp}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selling Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    name="selling_price"
                    value={formData.selling_price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  HSN Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="hsn_code"
                  value={formData.hsn_code}
                  onChange={handleChange}
                  required
                  maxLength={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., 8517"
                />
                <p className="text-xs text-gray-500 mt-1">Harmonized System of Nomenclature code for tax classification</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GST Rate (%) <span className="text-red-500">*</span>
                </label>
                <select
                  name="gst_percentage"
                  value={formData.gst_percentage}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="0">0% - Essential goods (grains, milk, etc.)</option>
                  <option value="5">5% - Common use items (sugar, tea, coffee, etc.)</option>
                  <option value="12">12% - Processed foods, computers, etc.</option>
                  <option value="18">18% - Most goods (default)</option>
                  <option value="28">28% - Luxury items (cars, tobacco, etc.)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Select GST slab based on HSN code</p>
              </div>

              {formData.mrp && formData.selling_price && parseFloat(formData.mrp) > parseFloat(formData.selling_price) && (
                <div className="md:col-span-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <span className="text-xl">💰</span>
                    <span className="font-semibold">
                      Discount: {(((parseFloat(formData.mrp) - parseFloat(formData.selling_price)) / parseFloat(formData.mrp)) * 100).toFixed(0)}% off
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Specifications (Optional)</h2>
            <textarea
              name="specifications"
              value={formData.specifications}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter product specifications (one per line)&#10;Example:&#10;Color: Black&#10;Weight: 200g&#10;Dimensions: 10x5x2 cm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Product...
                </span>
              ) : (
                'Create Product'
              )}
            </button>
            <Link
              href="/vendor/products"
              className="px-6 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

