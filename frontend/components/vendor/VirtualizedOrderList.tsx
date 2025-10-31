'use client';

import { FixedSizeList as List } from 'react-window';
import { useRef, useEffect, useState } from 'react';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  product_name: string;
  quantity: number;
  total_amount: number;
  status: string;
  created_at: string;
}

interface VirtualizedOrderListProps {
  orders: Order[];
  onViewDetails: (order: Order) => void;
  onUpdateStatus: (order: Order) => void;
}

export default function VirtualizedOrderList({
  orders,
  onViewDetails,
  onUpdateStatus,
}: VirtualizedOrderListProps) {
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
    const order = orders[index];

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'processing':
          return 'bg-blue-100 text-blue-800';
        case 'ready_to_ship':
          return 'bg-purple-100 text-purple-800';
        case 'shipped':
          return 'bg-indigo-100 text-indigo-800';
        case 'delivered':
          return 'bg-green-100 text-green-800';
        case 'cancelled':
          return 'bg-red-100 text-red-800';
        case 'returned':
          return 'bg-orange-100 text-orange-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    };

    return (
      <div
        style={style}
        className="flex items-center px-6 border-b border-gray-200 hover:bg-gray-50 bg-white"
      >
        {/* Order Number */}
        <div className="w-32 pr-4">
          <p className="text-sm font-semibold text-blue-600">#{order.order_number}</p>
        </div>

        {/* Customer */}
        <div className="w-48 pr-4">
          <p className="text-sm text-gray-900 truncate">{order.customer_name}</p>
        </div>

        {/* Product */}
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-sm text-gray-900 truncate">{order.product_name}</p>
        </div>

        {/* Quantity */}
        <div className="w-24 pr-4">
          <p className="text-sm text-gray-600">{order.quantity}</p>
        </div>

        {/* Amount */}
        <div className="w-32 pr-4">
          <p className="text-sm font-semibold text-gray-900">
            ₹{order.total_amount.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Status */}
        <div className="w-40 pr-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
              order.status
            )}`}
          >
            {order.status.replace('_', ' ')}
          </span>
        </div>

        {/* Date */}
        <div className="w-32 pr-4">
          <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
        </div>

        {/* Actions */}
        <div className="w-48 flex space-x-2">
          <button
            onClick={() => onViewDetails(order)}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            View
          </button>
          <button
            onClick={() => onUpdateStatus(order)}
            className="text-purple-600 hover:text-purple-800 font-medium text-sm"
          >
            Update Status
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="flex items-center px-6 py-3 bg-gray-50 border-b border-gray-200 font-medium text-xs text-gray-500 uppercase">
        <div className="w-32 pr-4">Order #</div>
        <div className="w-48 pr-4">Customer</div>
        <div className="flex-1 pr-4">Product</div>
        <div className="w-24 pr-4">Qty</div>
        <div className="w-32 pr-4">Amount</div>
        <div className="w-40 pr-4">Status</div>
        <div className="w-32 pr-4">Date</div>
        <div className="w-48">Actions</div>
      </div>

      {/* Virtualized List */}
      {orders.length > 0 ? (
        <List
          ref={listRef}
          height={containerHeight}
          itemCount={orders.length}
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
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <p className="text-lg font-semibold mb-2">No Orders Found</p>
          <p>Orders will appear here when customers place them</p>
        </div>
      )}
    </div>
  );
}

