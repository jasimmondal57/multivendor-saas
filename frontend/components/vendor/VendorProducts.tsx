'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import ProductVariantsModal from './ProductVariantsModal';
import QuickEditPanel from './QuickEditPanel';
import BulkEditModal from './BulkEditModal';
// import VirtualizedProductList from './VirtualizedProductList'; // Temporarily disabled

// Multi-Select Dropdown Component
interface MultiSelectDropdownProps {
  options: string[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  required?: boolean;
}

function MultiSelectDropdown({ options, value, onChange, placeholder, required }: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    const newValue = value.includes(option)
      ? value.filter(v => v !== option)
      : [...value, option];
    onChange(newValue);
  };

  const displayText = value.length === 0
    ? placeholder
    : value.length === 1
    ? value[0]
    : `${value.length} selected`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white flex items-center justify-between"
      >
        <span className={value.length === 0 ? 'text-gray-400' : 'text-gray-900'}>
          {displayText}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((option) => (
            <label
              key={option}
              className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={value.includes(option)}
                onChange={() => toggleOption(option)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3"
              />
              <span className="text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

interface Product {
  id: number;
  name: string;
  sku: string;
  category: { id: number; name: string };
  mrp: number;
  selling_price: number;
  cost_price?: number;
  stock_quantity: number;
  stock_status: string;
  status: string;
  description?: string;
  short_description?: string;
  weight?: number;
  hsn_code?: string;
  gst_percentage?: number;
  is_returnable?: boolean;
  return_period_days?: number;
  low_stock_threshold?: number;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface CategoryAttribute {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  input_type: 'text' | 'number' | 'select' | 'multi_select' | 'color' | 'textarea';
  options: string[] | null;
  is_required: boolean;
  is_filterable: boolean;
  is_variant: boolean;
  sort_order: number;
  help_text: string | null;
}

interface ProductFormData {
  category_id: string;
  name: string;
  sku: string;
  description: string;
  short_description: string;
  mrp: string;
  selling_price: string;
  cost_price: string;
  stock_quantity: string;
  low_stock_threshold: string;
  weight: string;
  hsn_code: string;
  gst_percentage: string;
}

export default function VendorProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [showVariantsModal, setShowVariantsModal] = useState(false);
  const [selectedProductForVariants, setSelectedProductForVariants] = useState<Product | null>(null);
  const [useVirtualization, setUseVirtualization] = useState(false);
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [quickEditProduct, setQuickEditProduct] = useState<Product | null>(null);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttribute[]>([]);
  const [productAttributes, setProductAttributes] = useState<Record<number, any>>({});

  // Inventory Management States
  const [showStockModal, setShowStockModal] = useState(false);
  const [showStockHistoryModal, setShowStockHistoryModal] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState<Product | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState({
    type: 'increase' as 'increase' | 'decrease',
    quantity: 0,
    reason: 'restock' as 'restock' | 'sale' | 'damage' | 'return' | 'correction' | 'initial' | 'other',
    notes: '',
  });
  const [stockHistory, setStockHistory] = useState<any[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    category_id: '',
    name: '',
    sku: '',
    description: '',
    short_description: '',
    mrp: '',
    selling_price: '',
    cost_price: '',
    stock_quantity: '',
    low_stock_threshold: '10',
    weight: '',
    hsn_code: '',
    gst_percentage: '18',
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [filter, categoryFilter, currentPage, perPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        per_page: perPage,
      };
      if (filter !== 'all') {
        params.status = filter;
      }
      if (categoryFilter !== 'all') {
        params.category_id = categoryFilter;
      }
      const response = await api.get('/v1/vendor/products', { params });
      if (response.data.success) {
        const data = response.data.data;
        setProducts(data.data || []);
        setCurrentPage(data.current_page || 1);
        setTotalPages(data.last_page || 1);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProducts = () => {
    return products.filter(product => {
      // Search filter
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !product.sku.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Price range filter
      if (priceRange.min && product.selling_price < parseFloat(priceRange.min)) {
        return false;
      }
      if (priceRange.max && product.selling_price > parseFloat(priceRange.max)) {
        return false;
      }
      return true;
    });
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/v1/categories');
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

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

  const fetchProductAttributes = async (productId: number) => {
    try {
      const response = await api.get(`/v1/vendor/products/${productId}/attributes`);
      if (response.data.success) {
        const attrs: Record<number, any> = {};
        response.data.data.forEach((attr: any) => {
          // Parse JSON values for multi_select
          try {
            attrs[attr.category_attribute_id] = JSON.parse(attr.value);
          } catch {
            attrs[attr.category_attribute_id] = attr.value;
          }
        });
        setProductAttributes(attrs);
      }
    } catch (error) {
      console.error('Failed to fetch product attributes:', error);
    }
  };

  const handleOpenModal = async (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        category_id: product.category.id.toString(),
        name: product.name,
        sku: product.sku,
        description: product.description || '',
        short_description: product.short_description || '',
        mrp: product.mrp.toString(),
        selling_price: product.selling_price.toString(),
        cost_price: product.cost_price?.toString() || '',
        stock_quantity: product.stock_quantity.toString(),
        low_stock_threshold: product.low_stock_threshold?.toString() || '10',
        weight: product.weight?.toString() || '',
        hsn_code: product.hsn_code || '',
        gst_percentage: product.gst_percentage?.toString() || '18',
      });
      // Fetch category attributes and product attributes
      await fetchCategoryAttributes(product.category.id);
      await fetchProductAttributes(product.id);
    } else {
      setEditingProduct(null);
      setUploadedImages([]);
      setCategoryAttributes([]);
      setProductAttributes({});
      setFormData({
        category_id: '',
        name: '',
        sku: '',
        description: '',
        short_description: '',
        mrp: '',
        selling_price: '',
        cost_price: '',
        stock_quantity: '',
        low_stock_threshold: '10',
        weight: '',
        hsn_code: '',
        gst_percentage: '18',
      });
    }
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validate file sizes (max 5MB per file)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    const oversizedFiles = Array.from(files).filter(file => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(2)}MB)`).join(', ');
      alert(`The following files exceed the 5MB limit:\n${fileNames}\n\nPlease compress or resize these images before uploading.`);
      e.target.value = ''; // Clear the input
      return;
    }

    // Validate total number of images
    if (uploadedImages.length + files.length > 5) {
      alert(`You can only upload up to 5 images per product. You currently have ${uploadedImages.length} image(s).`);
      e.target.value = ''; // Clear the input
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images[]', file);
      });

      const response = await api.post('/v1/vendor/images/upload-multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        const newImages = response.data.data.map((img: any) => img.full_url);
        setUploadedImages(prev => [...prev, ...newImages]);
        alert('Images uploaded successfully');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to upload images';
      const errors = error.response?.data?.errors;

      if (errors) {
        const errorDetails = Object.values(errors).flat().join('\n');
        alert(`Upload failed:\n${errorDetails}`);
      } else {
        alert(errorMessage);
      }
    } finally {
      setUploadingImage(false);
      e.target.value = ''; // Clear the input
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleImportCSV = async () => {
    if (!importFile) {
      alert('Please select a CSV file');
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await api.post('/v1/vendor/products/bulk-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setImportResult(response.data.data);
        alert(response.data.message);
        fetchProducts();
        if (response.data.data.failed === 0) {
          setShowImportModal(false);
          setImportFile(null);
        }
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to import products');
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      ['name', 'sku', 'category', 'description', 'mrp', 'selling_price', 'cost_price', 'stock'],
      ['Sample Product', 'SKU001', 'Electronics', 'Sample description', '1000', '800', '600', '50'],
    ];

    const csvContent = template.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleCategoryChange = async (categoryId: string) => {
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

  const saveProductAttributes = async (productId: number) => {
    try {
      const attributes = Object.entries(productAttributes)
        .filter(([_, value]) => {
          // Filter out empty values
          if (Array.isArray(value)) return value.length > 0;
          return value !== '' && value !== null && value !== undefined;
        })
        .map(([attributeId, value]) => ({
          category_attribute_id: parseInt(attributeId),
          value: value,
        }));

      if (attributes.length > 0) {
        await api.post(`/v1/vendor/products/${productId}/attributes`, { attributes });
      }
    } catch (error) {
      console.error('Failed to save product attributes:', error);
      // Don't throw error, just log it
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        category_id: parseInt(formData.category_id),
        mrp: parseFloat(formData.mrp),
        selling_price: parseFloat(formData.selling_price),
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : undefined,
        stock_quantity: parseInt(formData.stock_quantity),
        low_stock_threshold: parseInt(formData.low_stock_threshold),
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        gst_percentage: parseFloat(formData.gst_percentage),
      };

      let productId: number;

      if (editingProduct) {
        const response = await api.put(`/v1/vendor/products/${editingProduct.id}`, payload);
        if (response.data.success) {
          productId = editingProduct.id;

          // Save product attributes
          if (categoryAttributes.length > 0) {
            await saveProductAttributes(productId);
          }

          alert('Product updated successfully! Pending admin approval.');
          handleCloseModal();
          fetchProducts();
        }
      } else {
        const response = await api.post('/v1/vendor/products', payload);
        if (response.data.success) {
          productId = response.data.data.id;

          // Save product attributes
          if (categoryAttributes.length > 0) {
            await saveProductAttributes(productId);
          }

          alert('Product created successfully! Pending admin approval.');
          handleCloseModal();
          fetchProducts();
        }
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await api.delete(`/v1/vendor/products/${id}`);
      if (response.data.success) {
        alert('Product deleted successfully');
        fetchProducts();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete product');
    }
  };

  // Inventory Management Functions
  const handleOpenStockModal = (product: Product) => {
    setSelectedProductForStock(product);
    setStockAdjustment({
      type: 'increase',
      quantity: 0,
      reason: 'restock',
      notes: '',
    });
    setShowStockModal(true);
  };

  const handleStockAdjustment = async () => {
    if (!selectedProductForStock) return;
    if (stockAdjustment.quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    try {
      const response = await api.post(`/v1/vendor/products/${selectedProductForStock.id}/update-stock`, stockAdjustment);
      if (response.data.success) {
        alert(`Stock ${stockAdjustment.type === 'increase' ? 'increased' : 'decreased'} successfully`);
        setShowStockModal(false);
        fetchProducts();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update stock');
    }
  };

  const handleToggleStatus = async (product: Product) => {
    if (product.status !== 'approved') {
      alert('Can only toggle status for approved products');
      return;
    }

    const action = product.is_active ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this product?`)) return;

    try {
      const response = await api.post(`/v1/vendor/products/${product.id}/toggle-status`);
      if (response.data.success) {
        alert(response.data.message);
        fetchProducts();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleViewStockHistory = async (product: Product) => {
    setSelectedProductForStock(product);
    setShowStockHistoryModal(true);

    try {
      const response = await api.get(`/v1/vendor/products/${product.id}/stock-history`);
      if (response.data.success) {
        setStockHistory(response.data.data.data || []);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to fetch stock history');
    }
  };

  const toggleSelectProduct = (id: number) => {
    setSelectedProducts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      alert('Please select products to delete');
      return;
    }
    if (!confirm(`Are you sure you want to delete ${selectedProducts.length} product(s)?`)) return;

    try {
      const response = await api.post('/v1/vendor/products/bulk-delete', {
        product_ids: selectedProducts,
      });
      if (response.data.success) {
        alert('Products deleted successfully');
        setSelectedProducts([]);
        fetchProducts();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete products');
    }
  };

  const handleDuplicate = async (id: number) => {
    if (!confirm('Do you want to duplicate this product?')) return;

    try {
      const response = await api.post(`/v1/vendor/products/${id}/duplicate`);
      if (response.data.success) {
        alert('Product duplicated successfully! Pending admin approval.');
        fetchProducts();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to duplicate product');
    }
  };

  const handleQuickEdit = (product: Product) => {
    setQuickEditProduct(product);
    setShowQuickEdit(true);
  };

  const handleBulkExport = () => {
    if (products.length === 0) {
      alert('No products to export');
      return;
    }

    const csvData = products.map(p => ({
      Name: p.name,
      SKU: p.sku,
      Category: p.category?.name || '',
      MRP: p.mrp,
      'Selling Price': p.selling_price,
      'Cost Price': p.cost_price || '',
      Stock: p.stock_quantity,
      'Stock Status': p.stock_status,
      Status: p.status,
      'Created At': new Date(p.created_at).toLocaleDateString('en-IN'),
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => `"${row[h as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      banned: 'bg-gray-900 text-white',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStockBadge = (status: string) => {
    const badges: Record<string, string> = {
      in_stock: 'bg-green-100 text-green-800',
      out_of_stock: 'bg-red-100 text-red-800',
      low_stock: 'bg-orange-100 text-orange-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Products</h1>
          <p className="text-gray-600">Manage your product inventory</p>
        </div>
        <div className="flex space-x-3">
          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 flex items-center transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              title="List View"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 flex items-center transition-colors ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              title="Grid View"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>
          <button
            onClick={handleBulkExport}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Import CSV
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        </div>
      </div>

      {/* Filters and Bulk Actions */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex space-x-4">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        {selectedProducts.length > 0 && (
          <div className="flex items-center space-x-3 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
            <span className="text-sm font-semibold text-blue-900">{selectedProducts.length} selected</span>
            <div className="h-6 w-px bg-blue-300"></div>
            <button
              onClick={() => setShowBulkEdit(true)}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-all flex items-center"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Bulk Edit
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-all flex items-center"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
            <button
              onClick={() => setSelectedProducts([])}
              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-all"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      <div className="mb-6 bg-white rounded-xl shadow border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or SKU..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
            <input
              type="number"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              placeholder="₹0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
            <input
              type="number"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              placeholder="₹10000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow border border-gray-200">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : getFilteredProducts().length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getFilteredProducts().map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => toggleSelectProduct(product.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{product.sku}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{product.category?.name}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">₹{product.selling_price.toLocaleString('en-IN')}</div>
                        <div className="text-gray-500 line-through">₹{product.mrp.toLocaleString('en-IN')}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{product.stock_quantity}</div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStockBadge(product.stock_status)}`}>
                          {product.stock_status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-wrap gap-2">
                        {/* Inventory Management Actions */}
                        <button
                          onClick={() => handleOpenStockModal(product)}
                          className="text-orange-600 hover:text-orange-800 font-medium flex items-center"
                          title="Adjust Stock"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          Stock
                        </button>
                        {product.status === 'approved' && (
                          <button
                            onClick={() => handleToggleStatus(product)}
                            className={`font-medium flex items-center ${product.is_active ? 'text-yellow-600 hover:text-yellow-800' : 'text-green-600 hover:text-green-800'}`}
                            title={product.is_active ? 'Deactivate' : 'Activate'}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {product.is_active ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              )}
                            </svg>
                            {product.is_active ? 'Hide' : 'Show'}
                          </button>
                        )}
                        <button
                          onClick={() => handleViewStockHistory(product)}
                          className="text-gray-600 hover:text-gray-800 font-medium flex items-center"
                          title="Stock History"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          History
                        </button>

                        {/* Existing Actions */}
                        <button
                          onClick={() => handleQuickEdit(product)}
                          className="text-green-600 hover:text-green-800 font-medium flex items-center"
                          title="Quick Edit"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Quick
                        </button>
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDuplicate(product.id)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                          title="Duplicate Product"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Clone
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProductForVariants(product);
                            setShowVariantsModal(true);
                          }}
                          className="text-purple-600 hover:text-purple-800 font-medium"
                        >
                          Variants
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, total)} of {total} products
                  </span>
                  <select
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    First
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 border rounded-lg text-sm ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Last
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p>No products found</p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Your First Product
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter product name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SKU <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter SKU"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.category_id}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Short Description
                    </label>
                    <input
                      type="text"
                      value={formData.short_description}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Brief product description"
                      maxLength={500}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Description
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Detailed product description"
                    />
                  </div>
                </div>
              </div>

              {/* Category-Specific Attributes */}
              {categoryAttributes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Attributes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={`Enter ${attr.name.toLowerCase()}`}
                          />
                        )}

                        {attr.input_type === 'number' && (
                          <input
                            type="number"
                            required={attr.is_required}
                            value={productAttributes[attr.id] || ''}
                            onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={`Enter ${attr.name.toLowerCase()}`}
                          />
                        )}

                        {attr.input_type === 'textarea' && (
                          <textarea
                            rows={3}
                            required={attr.is_required}
                            value={productAttributes[attr.id] || ''}
                            onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={`Enter ${attr.name.toLowerCase()}`}
                          />
                        )}

                        {attr.input_type === 'select' && attr.options && (
                          <select
                            required={attr.is_required}
                            value={productAttributes[attr.id] || ''}
                            onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          <MultiSelectDropdown
                            options={attr.options}
                            value={productAttributes[attr.id] || []}
                            onChange={(values) => handleAttributeChange(attr.id, values)}
                            placeholder={`Select ${attr.name.toLowerCase()}`}
                            required={attr.is_required}
                          />
                        )}

                        {attr.input_type === 'color' && (
                          <input
                            type="color"
                            required={attr.is_required}
                            value={productAttributes[attr.id] || '#000000'}
                            onChange={(e) => handleAttributeChange(attr.id, e.target.value)}
                            className="w-full h-10 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

              {/* Product Images */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Images (Max 5 images, 5MB each)
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                      onChange={handleImageUpload}
                      disabled={uploadingImage || uploadedImages.length >= 5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: JPEG, PNG, JPG, GIF, WebP. Max size: 5MB per image.
                    </p>
                    {uploadingImage && (
                      <p className="text-sm text-blue-600 mt-2 flex items-center">
                        <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading images...
                      </p>
                    )}
                    {uploadedImages.length >= 5 && (
                      <p className="text-sm text-orange-600 mt-2">
                        ⚠️ Maximum 5 images reached. Remove an image to upload more.
                      </p>
                    )}
                  </div>

                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {uploadedImages.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Product ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      MRP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={formData.mrp}
                      onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selling Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={formData.selling_price}
                      onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cost Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.cost_price}
                      onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Inventory */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Low Stock Threshold
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.low_stock_threshold}
                      onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="10"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      HSN Code
                    </label>
                    <input
                      type="text"
                      value={formData.hsn_code}
                      onChange={(e) => setFormData({ ...formData, hsn_code: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter HSN code"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GST Percentage
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.gst_percentage}
                      onChange={(e) => setFormData({ ...formData, gst_percentage: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="18"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <h4 className="text-sm font-semibold text-blue-900 mb-1">Return Policy Information</h4>
                          <p className="text-sm text-blue-800">
                            Return policy is managed by the platform admin. All products follow the platform-wide return policy
                            configured in Admin Settings → Shipping & Return Settings.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Import Products from CSV</h2>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setImportResult(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Download the template CSV file below</li>
                  <li>Fill in your product data (Name and SKU are required)</li>
                  <li>Category names must match existing categories</li>
                  <li>All imported products will be set to "Pending" status</li>
                  <li>Maximum file size: 10MB</li>
                </ul>
              </div>

              {/* Download Template */}
              <div>
                <button
                  onClick={handleDownloadTemplate}
                  className="w-full px-4 py-3 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-medium text-gray-700">Download CSV Template</span>
                </button>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select CSV File
                </label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {importFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {importFile.name} ({(importFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              {/* Import Result */}
              {importResult && (
                <div className={`border rounded-lg p-4 ${
                  importResult.failed === 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <h3 className="font-semibold mb-2">Import Results:</h3>
                  <p className="text-sm mb-2">
                    ✅ Successfully imported: <strong>{importResult.imported}</strong> products
                  </p>
                  {importResult.failed > 0 && (
                    <>
                      <p className="text-sm mb-2">
                        ❌ Failed: <strong>{importResult.failed}</strong> products
                      </p>
                      {importResult.errors.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-semibold mb-1">Errors:</p>
                          <div className="max-h-40 overflow-y-auto bg-white rounded border border-gray-200 p-2">
                            {importResult.errors.map((error: string, index: number) => (
                              <p key={index} className="text-xs text-red-600 mb-1">{error}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setImportResult(null);
                  }}
                  className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportCSV}
                  disabled={!importFile || importing}
                  className="flex-1 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importing ? 'Importing...' : 'Import Products'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Variants Modal */}
      {showVariantsModal && selectedProductForVariants && (
        <ProductVariantsModal
          productId={selectedProductForVariants.id}
          productName={selectedProductForVariants.name}
          onClose={() => {
            setShowVariantsModal(false);
            setSelectedProductForVariants(null);
          }}
        />
      )}

      {/* Quick Edit Panel */}
      {showQuickEdit && quickEditProduct && (
        <QuickEditPanel
          product={quickEditProduct}
          onClose={() => {
            setShowQuickEdit(false);
            setQuickEditProduct(null);
          }}
          onUpdate={() => {
            fetchProducts();
          }}
        />
      )}

      {/* Bulk Edit Modal */}
      {showBulkEdit && (
        <BulkEditModal
          selectedProductIds={selectedProducts}
          categories={categories}
          onClose={() => setShowBulkEdit(false)}
          onUpdate={() => {
            setSelectedProducts([]);
            fetchProducts();
          }}
        />
      )}

      {/* Stock Adjustment Modal */}
      {showStockModal && selectedProductForStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Adjust Stock</h2>
              <button onClick={() => setShowStockModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600">Product</p>
                <p className="font-semibold text-gray-900">{selectedProductForStock.name}</p>
                <p className="text-sm text-gray-500">Current Stock: <span className="font-medium text-gray-900">{selectedProductForStock.stock_quantity}</span></p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adjustment Type</label>
                <select
                  value={stockAdjustment.type}
                  onChange={(e) => setStockAdjustment({ ...stockAdjustment, type: e.target.value as 'increase' | 'decrease' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="increase">Increase Stock</option>
                  <option value="decrease">Decrease Stock</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={stockAdjustment.quantity}
                  onChange={(e) => setStockAdjustment({ ...stockAdjustment, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter quantity"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <select
                  value={stockAdjustment.reason}
                  onChange={(e) => setStockAdjustment({ ...stockAdjustment, reason: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="restock">Restock - New inventory received</option>
                  <option value="sale">Sale - Sold to customer</option>
                  <option value="damage">Damage - Damaged/defective items</option>
                  <option value="return">Return - Customer return</option>
                  <option value="correction">Correction - Manual correction</option>
                  <option value="initial">Initial - Initial stock setup</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={stockAdjustment.notes}
                  onChange={(e) => setStockAdjustment({ ...stockAdjustment, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add any additional notes..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">New Stock:</span>{' '}
                  {stockAdjustment.type === 'increase'
                    ? selectedProductForStock.stock_quantity + stockAdjustment.quantity
                    : Math.max(0, selectedProductForStock.stock_quantity - stockAdjustment.quantity)}
                </p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-200">
              <button
                onClick={() => setShowStockModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleStockAdjustment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock History Modal */}
      {showStockHistoryModal && selectedProductForStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Stock History</h2>
                <p className="text-sm text-gray-600">{selectedProductForStock.name}</p>
              </div>
              <button onClick={() => setShowStockHistoryModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {stockHistory.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-500">No stock history available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stockHistory.map((history: any) => (
                    <div key={history.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            history.type === 'increase' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {history.type === 'increase' ? '↑ Increase' : '↓ Decrease'}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {history.type === 'increase' ? '+' : '-'}{history.quantity} units
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(history.created_at).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-2">
                        <div>
                          <p className="text-xs text-gray-500">Previous Stock</p>
                          <p className="text-sm font-medium text-gray-900">{history.previous_stock}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">New Stock</p>
                          <p className="text-sm font-medium text-gray-900">{history.new_stock}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Reason</p>
                          <p className="text-sm font-medium text-gray-900 capitalize">{history.reason.replace('_', ' ')}</p>
                        </div>
                      </div>

                      {history.notes && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500">Notes</p>
                          <p className="text-sm text-gray-700">{history.notes}</p>
                        </div>
                      )}

                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Updated by: <span className="font-medium text-gray-700">{history.user?.name || 'Unknown'}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setShowStockHistoryModal(false)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

