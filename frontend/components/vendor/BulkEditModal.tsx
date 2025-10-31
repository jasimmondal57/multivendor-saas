'use client';

import { useState } from 'react';
import api from '@/lib/api';

interface Category {
  id: number;
  name: string;
}

interface BulkEditModalProps {
  selectedProductIds: number[];
  categories: Category[];
  onClose: () => void;
  onUpdate: () => void;
}

export default function BulkEditModal({ selectedProductIds, categories, onClose, onUpdate }: BulkEditModalProps) {
  const [editType, setEditType] = useState<'price' | 'stock' | 'category' | 'status'>('price');
  const [formData, setFormData] = useState({
    selling_price: '',
    mrp: '',
    stock_quantity: '',
    category_id: '',
    status: 'approved',
    price_adjustment_type: 'fixed', // fixed or percentage
    price_adjustment_value: '',
    stock_adjustment_type: 'set', // set, add, subtract
    stock_adjustment_value: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updates: any = {};

      if (editType === 'price') {
        if (formData.price_adjustment_type === 'fixed') {
          if (formData.selling_price) updates.selling_price = parseFloat(formData.selling_price);
          if (formData.mrp) updates.mrp = parseFloat(formData.mrp);
        }
      } else if (editType === 'stock') {
        if (formData.stock_adjustment_type === 'set') {
          updates.stock_quantity = parseInt(formData.stock_adjustment_value);
        }
      } else if (editType === 'category') {
        updates.category_id = parseInt(formData.category_id);
      } else if (editType === 'status') {
        updates.status = formData.status;
      }

      await api.post('/v1/vendor/products/bulk-update', {
        product_ids: selectedProductIds,
        updates,
      });

      alert(`${selectedProductIds.length} products updated successfully! Pending admin approval.`);
      onUpdate();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update products');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Bulk Edit Products</h2>
            <p className="text-sm text-gray-600 mt-1">{selectedProductIds.length} products selected</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Edit Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What would you like to edit?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEditType('price')}
                className={`px-4 py-3 border-2 rounded-lg text-left transition-all ${
                  editType === 'price'
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Price</div>
                <div className="text-xs text-gray-600 mt-1">Update MRP & Selling Price</div>
              </button>
              <button
                type="button"
                onClick={() => setEditType('stock')}
                className={`px-4 py-3 border-2 rounded-lg text-left transition-all ${
                  editType === 'stock'
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Stock</div>
                <div className="text-xs text-gray-600 mt-1">Update stock quantity</div>
              </button>
              <button
                type="button"
                onClick={() => setEditType('category')}
                className={`px-4 py-3 border-2 rounded-lg text-left transition-all ${
                  editType === 'category'
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Category</div>
                <div className="text-xs text-gray-600 mt-1">Change category</div>
              </button>
              <button
                type="button"
                onClick={() => setEditType('status')}
                className={`px-4 py-3 border-2 rounded-lg text-left transition-all ${
                  editType === 'status'
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Status</div>
                <div className="text-xs text-gray-600 mt-1">Activate/Deactivate</div>
              </button>
            </div>
          </div>

          {/* Price Edit Fields */}
          {editType === 'price' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Leave empty to keep unchanged"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.selling_price}
                    onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Leave empty to keep unchanged"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Stock Edit Fields */}
          {editType === 'stock' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={formData.stock_adjustment_value}
                  onChange={(e) => setFormData({ ...formData, stock_adjustment_value: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new stock quantity"
                  required
                />
              </div>
            </div>
          )}

          {/* Category Edit Fields */}
          {editType === 'category' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Category
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Edit Fields */}
          {editType === 'status' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="approved">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          )}

          {/* Warning Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-yellow-800">Admin Approval Required</p>
                <p className="text-sm text-yellow-700 mt-1">
                  All bulk changes will be pending admin approval before going live.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Updating...' : `Update ${selectedProductIds.length} Products`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

