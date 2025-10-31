'use client';

import { FixedSizeList as List } from 'react-window';
import { useRef, useEffect, useState } from 'react';

interface Product {
  id: number;
  name: string;
  sku: string;
  category: {
    id: number;
    name: string;
  };
  selling_price: number;
  stock_quantity: number;
  status: string;
}

interface VirtualizedProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onManageVariants: (product: Product) => void;
  selectedProducts: number[];
  onToggleSelect: (id: number) => void;
}

export default function VirtualizedProductList({
  products,
  onEdit,
  onDelete,
  onManageVariants,
  selectedProducts,
  onToggleSelect,
}: VirtualizedProductListProps) {
  const listRef = useRef<any>(null);
  const [containerHeight, setContainerHeight] = useState(600);

  useEffect(() => {
    // Calculate available height
    const updateHeight = () => {
      const windowHeight = window.innerHeight;
      const headerHeight = 200; // Approximate header + filters height
      const footerHeight = 100; // Approximate footer height
      setContainerHeight(windowHeight - headerHeight - footerHeight);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const product = products[index];
    const isSelected = selectedProducts.includes(product.id);

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'approved':
          return 'bg-green-100 text-green-800';
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'draft':
          return 'bg-gray-100 text-gray-800';
        case 'rejected':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div
        style={style}
        className={`flex items-center px-6 border-b border-gray-200 hover:bg-gray-50 ${
          isSelected ? 'bg-blue-50' : 'bg-white'
        }`}
      >
        {/* Checkbox */}
        <div className="w-12">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(product.id)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>

        {/* Product Name */}
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
          <p className="text-xs text-gray-500">{product.sku}</p>
        </div>

        {/* Category */}
        <div className="w-32 pr-4">
          <p className="text-sm text-gray-600 truncate">{product.category.name}</p>
        </div>

        {/* Price */}
        <div className="w-28 pr-4">
          <p className="text-sm font-semibold text-gray-900">
            ₹{product.selling_price.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Stock */}
        <div className="w-24 pr-4">
          <p
            className={`text-sm font-semibold ${
              product.stock_quantity > 10
                ? 'text-green-600'
                : product.stock_quantity > 0
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}
          >
            {product.stock_quantity}
          </p>
        </div>

        {/* Status */}
        <div className="w-32 pr-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
              product.status
            )}`}
          >
            {product.status}
          </span>
        </div>

        {/* Actions */}
        <div className="w-48 flex space-x-2">
          <button
            onClick={() => onEdit(product)}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onManageVariants(product)}
            className="text-purple-600 hover:text-purple-800 font-medium text-sm"
          >
            Variants
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="text-red-600 hover:text-red-800 font-medium text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="flex items-center px-6 py-3 bg-gray-50 border-b border-gray-200 font-medium text-xs text-gray-500 uppercase">
        <div className="w-12">
          <input
            type="checkbox"
            onChange={(e) => {
              if (e.target.checked) {
                products.forEach((p) => {
                  if (!selectedProducts.includes(p.id)) {
                    onToggleSelect(p.id);
                  }
                });
              } else {
                products.forEach((p) => {
                  if (selectedProducts.includes(p.id)) {
                    onToggleSelect(p.id);
                  }
                });
              }
            }}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
        </div>
        <div className="flex-1 pr-4">Product</div>
        <div className="w-32 pr-4">Category</div>
        <div className="w-28 pr-4">Price</div>
        <div className="w-24 pr-4">Stock</div>
        <div className="w-32 pr-4">Status</div>
        <div className="w-48">Actions</div>
      </div>

      {/* Virtualized List */}
      {products.length > 0 ? (
        <List
          ref={listRef}
          height={containerHeight}
          itemCount={products.length}
          itemSize={72} // Height of each row in pixels
          width="100%"
        >
          {Row}
        </List>
      ) : (
        <div className="py-12 text-center text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <p className="text-lg font-semibold mb-2">No Products Found</p>
          <p>Add your first product to get started</p>
        </div>
      )}
    </div>
  );
}

