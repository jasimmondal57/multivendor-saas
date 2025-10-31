'use client';

import { useState } from 'react';

export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface DataTableProps {
  columns: Column[];
  data: any[];
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  onBulkAction?: (action: string, selectedIds: number[]) => void;
  currentPage?: number;
  totalPages?: number;
  perPage?: number;
  totalItems?: number;
  bulkActions?: { value: string; label: string }[];
  selectable?: boolean;
  exportable?: boolean;
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void;
}

export default function DataTable({
  columns,
  data,
  onSort,
  onPageChange,
  onPerPageChange,
  onBulkAction,
  currentPage = 1,
  totalPages = 1,
  perPage = 20,
  totalItems = 0,
  bulkActions = [],
  selectable = false,
  exportable = false,
  onExport,
}: DataTableProps) {
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkActionValue, setBulkActionValue] = useState('');

  const handleSort = (key: string) => {
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(newDirection);
    onSort?.(key, newDirection);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(data.map(row => row.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    }
  };

  const handleBulkAction = () => {
    if (bulkActionValue && selectedIds.length > 0) {
      onBulkAction?.(bulkActionValue, selectedIds);
      setSelectedIds([]);
      setBulkActionValue('');
    }
  };

  const isAllSelected = data.length > 0 && selectedIds.length === data.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < data.length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Bulk Actions */}
          {selectable && bulkActions.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                value={bulkActionValue}
                onChange={(e) => setBulkActionValue(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                disabled={selectedIds.length === 0}
              >
                <option value="">Bulk Actions</option>
                {bulkActions.map(action => (
                  <option key={action.value} value={action.value}>{action.label}</option>
                ))}
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkActionValue || selectedIds.length === 0}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
              >
                Apply
              </button>
              {selectedIds.length > 0 && (
                <span className="text-sm text-gray-600">
                  {selectedIds.length} selected
                </span>
              )}
            </div>
          )}

          {/* Per Page Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={perPage}
              onChange={(e) => onPerPageChange?.(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Export Buttons */}
        {exportable && onExport && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Export:</span>
            <button
              onClick={() => onExport('csv')}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              CSV
            </button>
            <button
              onClick={() => onExport('excel')}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Excel
            </button>
            <button
              onClick={() => onExport('pdf')}
              className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
            >
              PDF
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="py-3 px-4 text-left w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isSomeSelected;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="py-3 px-4 text-left font-semibold text-gray-700"
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center gap-2 hover:text-red-600"
                    >
                      {column.label}
                      <span className="text-gray-400">
                        {sortKey === column.key ? (
                          sortDirection === 'asc' ? '↑' : '↓'
                        ) : (
                          '↕'
                        )}
                      </span>
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row) => (
                <tr
                  key={row.id}
                  className={`border-t border-gray-100 hover:bg-gray-50 ${
                    selectedIds.includes(row.id) ? 'bg-red-50' : ''
                  }`}
                >
                  {selectable && (
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onChange={(e) => handleSelectRow(row.id, e.target.checked)}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className="py-3 px-4 text-gray-700">
                      {column.render
                        ? column.render(row[column.key], row)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-8 text-center text-gray-500"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * perPage + 1} to{' '}
            {Math.min(currentPage * perPage, totalItems)} of {totalItems} entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Previous
            </button>
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
                  onClick={() => onPageChange?.(pageNum)}
                  className={`px-3 py-2 border rounded-lg text-sm font-medium ${
                    currentPage === pageNum
                      ? 'bg-red-600 text-white border-red-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

