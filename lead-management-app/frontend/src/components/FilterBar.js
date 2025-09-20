import React from 'react';
import { ChevronDown, Filter } from 'lucide-react';

const FilterBar = ({ filters, onFilterChange }) => {
  const statusOptions = [
    { value: 'all', label: 'All' },
    { value: 'new', label: 'New' },
    { value: 'connected', label: 'Connected' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'converted', label: 'Converted' }
  ];

  const sourceOptions = [
    { value: 'all', label: 'All' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'website', label: 'Website' },
    { value: 'referral', label: 'Referral' },
    { value: 'cold-call', label: 'Cold Call' },
    { value: 'email', label: 'Email Campaign' }
  ];

  const handleFilterChange = (filterType, value) => {
    onFilterChange({
      ...filters,
      [filterType]: value
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>
        
        <div className="flex items-center gap-4 flex-1">
          {/* Status Filter */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="relative">
              <select
                value={filters.status || 'all'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Source Filter */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Source
            </label>
            <div className="relative">
              <select
                value={filters.source || 'all'}
                onChange={(e) => handleFilterChange('source', e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {sourceOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Clear Filters */}
          {(filters.status !== 'all' || filters.source !== 'all') && (
            <button
              onClick={() => onFilterChange({ status: 'all', source: 'all' })}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;