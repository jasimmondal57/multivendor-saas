'use client';

import { useState } from 'react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface Filter {
  key: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'daterange' | 'number';
  options?: FilterOption[];
  placeholder?: string;
}

export interface AdvancedFiltersProps {
  filters: Filter[];
  onFilterChange: (filters: Record<string, any>) => void;
  onClearFilters: () => void;
}

export default function AdvancedFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: AdvancedFiltersProps) {
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    setFilterValues({});
    onClearFilters();
  };

  const activeFilterCount = Object.values(filterValues).filter(
    (value) => value !== '' && value !== null && value !== undefined
  ).length;

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Advanced Filters
          {activeFilterCount > 0 && (
            <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {filter.label}
                </label>

                {filter.type === 'text' && (
                  <input
                    type="text"
                    value={filterValues[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    placeholder={filter.placeholder}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                )}

                {filter.type === 'number' && (
                  <input
                    type="number"
                    value={filterValues[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    placeholder={filter.placeholder}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                )}

                {filter.type === 'select' && (
                  <select
                    value={filterValues[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">All</option>
                    {filter.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                {filter.type === 'multiselect' && (
                  <select
                    multiple
                    value={filterValues[filter.key] || []}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      handleFilterChange(filter.key, selected);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    size={4}
                  >
                    {filter.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                {filter.type === 'daterange' && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={filterValues[`${filter.key}_from`] || ''}
                      onChange={(e) => handleFilterChange(`${filter.key}_from`, e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="From"
                    />
                    <input
                      type="date"
                      value={filterValues[`${filter.key}_to`] || ''}
                      onChange={(e) => handleFilterChange(`${filter.key}_to`, e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="To"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600 font-medium">Active Filters:</span>
                {Object.entries(filterValues).map(([key, value]) => {
                  if (!value || (Array.isArray(value) && value.length === 0)) return null;
                  
                  const filter = filters.find(f => f.key === key || key.startsWith(f.key));
                  if (!filter) return null;

                  let displayValue = value;
                  if (filter.type === 'select' && filter.options) {
                    const option = filter.options.find(o => o.value === value);
                    displayValue = option?.label || value;
                  } else if (Array.isArray(value)) {
                    displayValue = value.join(', ');
                  }

                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                    >
                      <span className="font-medium">{filter.label}:</span>
                      <span>{displayValue}</span>
                      <button
                        onClick={() => handleFilterChange(key, '')}
                        className="hover:text-red-900"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

