'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface Variant {
  id?: number;
  sku: string;
  variant_name: string;
  attributes: Record<string, string>;
  price: number;
  compare_at_price?: number;
  stock_quantity: number;
  low_stock_threshold: number;
  weight?: number;
  image?: string;
  is_active: boolean;
  sort_order: number;
}

interface ProductVariantsModalProps {
  productId: number;
  productName: string;
  onClose: () => void;
}

export default function ProductVariantsModal({ productId, productName, onClose }: ProductVariantsModalProps) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [formData, setFormData] = useState<Variant>({
    sku: '',
    variant_name: '',
    attributes: {},
    price: 0,
    compare_at_price: 0,
    stock_quantity: 0,
    low_stock_threshold: 5,
    weight: 0,
    image: '',
    is_active: true,
    sort_order: 0,
  });
  const [attributeKey, setAttributeKey] = useState('');
  const [attributeValue, setAttributeValue] = useState('');

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/v1/vendor/products/${productId}/variants`);
      if (response.data.success) {
        setVariants(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch variants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttribute = () => {
    if (attributeKey && attributeValue) {
      setFormData({
        ...formData,
        attributes: {
          ...formData.attributes,
          [attributeKey]: attributeValue,
        },
      });
      setAttributeKey('');
      setAttributeValue('');
    }
  };

  const handleRemoveAttribute = (key: string) => {
    const newAttributes = { ...formData.attributes };
    delete newAttributes[key];
    setFormData({ ...formData, attributes: newAttributes });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingVariant?.id) {
        // Update existing variant
        await api.put(`/v1/vendor/products/${productId}/variants/${editingVariant.id}`, formData);
      } else {
        // Create new variant
        await api.post(`/v1/vendor/products/${productId}/variants`, formData);
      }
      
      fetchVariants();
      resetForm();
    } catch (error: any) {
      console.error('Failed to save variant:', error);
      alert(error.response?.data?.message || 'Failed to save variant');
    }
  };

  const handleEdit = (variant: Variant) => {
    setEditingVariant(variant);
    setFormData(variant);
    setShowAddForm(true);
  };

  const handleDelete = async (variantId: number) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;

    try {
      await api.delete(`/v1/vendor/products/${productId}/variants/${variantId}`);
      fetchVariants();
    } catch (error) {
      console.error('Failed to delete variant:', error);
      alert('Failed to delete variant');
    }
  };

  const resetForm = () => {
    setFormData({
      sku: '',
      variant_name: '',
      attributes: {},
      price: 0,
      compare_at_price: 0,
      stock_quantity: 0,
      low_stock_threshold: 5,
      weight: 0,
      image: '',
      is_active: true,
      sort_order: 0,
    });
    setEditingVariant(null);
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600">
          <div>
            <h2 className="text-2xl font-bold text-white">Product Variants</h2>
            <p className="text-blue-100 text-sm mt-1">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Add Variant Button */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mb-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Variant
            </button>
          )}

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="mb-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {editingVariant ? 'Edit Variant' : 'Add New Variant'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Variant Name *</label>
                    <input
                      type="text"
                      value={formData.variant_name}
                      onChange={(e) => setFormData({ ...formData, variant_name: e.target.value })}
                      placeholder="e.g., Red - Large"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Compare at Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.compare_at_price || ''}
                      onChange={(e) => setFormData({ ...formData, compare_at_price: parseFloat(e.target.value) || undefined })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                    <input
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
                    <input
                      type="number"
                      value={formData.low_stock_threshold}
                      onChange={(e) => setFormData({ ...formData, low_stock_threshold: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Attributes Section */}
                <div className="border-t border-gray-200 pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Attributes (Color, Size, etc.)</label>
                  
                  {/* Current Attributes */}
                  {Object.keys(formData.attributes).length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Object.entries(formData.attributes).map(([key, value]) => (
                        <span key={key} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center">
                          <strong>{key}:</strong>&nbsp;{value}
                          <button
                            type="button"
                            onClick={() => handleRemoveAttribute(key)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Add Attribute */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={attributeKey}
                      onChange={(e) => setAttributeKey(e.target.value)}
                      placeholder="Attribute name (e.g., Color)"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={attributeValue}
                      onChange={(e) => setAttributeValue(e.target.value)}
                      placeholder="Value (e.g., Red)"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleAddAttribute}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
                  >
                    {editingVariant ? 'Update Variant' : 'Add Variant'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Variants List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading variants...</p>
            </div>
          ) : variants.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {variants.map((variant) => (
                <div key={variant.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold text-gray-900">{variant.variant_name}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${variant.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {variant.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">SKU:</span>
                          <p className="font-semibold text-gray-900">{variant.sku}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Price:</span>
                          <p className="font-semibold text-gray-900">₹{variant.price.toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Stock:</span>
                          <p className={`font-semibold ${variant.stock_quantity <= variant.low_stock_threshold ? 'text-red-600' : 'text-green-600'}`}>
                            {variant.stock_quantity} units
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Attributes:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(variant.attributes).map(([key, value]) => (
                              <span key={key} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(variant)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(variant.id!)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-lg font-semibold mb-2">No Variants Yet</p>
              <p>Add variants to offer different options for this product</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

