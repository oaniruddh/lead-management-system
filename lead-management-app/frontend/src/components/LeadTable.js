import React, { useState } from 'react';
import { Phone, Mail, Building2, ChevronDown } from 'lucide-react';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('LeadTable Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-red-900 mb-2">Error loading leads</h3>
          <p className="text-red-600 mb-4">Something went wrong while displaying the leads table.</p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Status dropdown component
const StatusDropdown = ({ lead, onStatusChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [notes, setNotes] = useState('');

  // Add safety check for lead object
  if (!lead) {
    console.warn('StatusDropdown: No lead data provided');
    return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Invalid</span>;
  }

  const statusOptions = [
    { value: 'new', label: 'New', color: 'bg-blue-100 text-blue-700' },
    { value: 'connected', label: 'Connected', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'qualified', label: 'Qualified', color: 'bg-green-100 text-green-700' },
    { value: 'converted', label: 'Converted', color: 'bg-purple-100 text-purple-700' }
  ];

  const currentStatus = statusOptions.find(option => option.value === lead.status) || statusOptions[0];

  const handleStatusChange = async (newStatus) => {
    if (newStatus === lead.status) {
      setIsOpen(false);
      return;
    }

    // For significant status changes, show notes modal
    if (newStatus === 'connected' || newStatus === 'qualified' || newStatus === 'converted') {
      setSelectedStatus(newStatus);
      setIsOpen(false);
      setShowNotesModal(true);
      return;
    }

    // For simple status changes (like back to 'new'), update directly
    setIsUpdating(true);
    try {
      await onStatusChange(lead._id || lead.id, newStatus);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusUpdateWithNotes = async () => {
    if (!selectedStatus) return;

    setIsUpdating(true);
    try {
      await onStatusChange(lead._id || lead.id, selectedStatus, notes);
      setShowNotesModal(false);
      setSelectedStatus(null);
      setNotes('');
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (disabled || !onStatusChange) {
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${currentStatus.color}`}>
        {currentStatus.label}
      </span>
    );
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => !isUpdating && setIsOpen(!isOpen)}
          disabled={isUpdating}
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${currentStatus.color} 
            hover:shadow-md transition-all duration-200 flex items-center gap-1
            ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
        >
          {isUpdating ? (
            <>
              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
              Updating...
            </>
          ) : (
            <>
              {currentStatus.label}
              <ChevronDown className="w-3 h-3" />
            </>
          )}
        </button>

        {isOpen && !isUpdating && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <div className="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 z-20 min-w-32">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 first:rounded-t-md last:rounded-b-md
                    ${option.value === lead.status ? 'bg-gray-100 font-medium' : ''}`}
                >
                  <span className={`inline-block px-2 py-0.5 rounded-full ${option.color} mr-2`}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-lg mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Update Status to {statusOptions.find(s => s.value === selectedStatus)?.label}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a note about this status change..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">{notes.length}/200 characters</p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowNotesModal(false);
                  setSelectedStatus(null);
                  setNotes('');
                }}
                disabled={isUpdating}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdateWithNotes}
                disabled={isUpdating}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isUpdating && <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin"></div>}
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const LeadTable = ({ leads, loading, onStatusChange }) => {
  // Add safety check for leads array
  const safeLeads = Array.isArray(leads) ? leads : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-gray-600">Loading leads...</span>
      </div>
    );
  }

  if (safeLeads.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
        <p className="text-gray-600">Start by adding your first lead.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Lead
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {safeLeads.map((lead, index) => {
            // Ensure we have a valid lead object
            if (!lead) {
              console.warn('Invalid lead data at index:', index);
              return null;
            }
            
            const leadKey = lead._id || lead.id || `lead-${index}`;
            
            return (
              <tr key={leadKey} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {(lead.firstName || lead.name || '').charAt(0)}{(lead.lastName || '').charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {lead.firstName && lead.lastName 
                          ? `${lead.firstName} ${lead.lastName}` 
                          : (lead.name || 'Unknown')
                        }
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                    {lead.company || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    {lead.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Phone className="w-4 h-4 text-gray-400 mr-2" />
                    {lead.phone}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusDropdown 
                    lead={lead} 
                    onStatusChange={onStatusChange}
                    disabled={loading}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Wrap LeadTable with error boundary
const LeadTableWithErrorBoundary = (props) => (
  <ErrorBoundary>
    <LeadTable {...props} />
  </ErrorBoundary>
);

export default LeadTableWithErrorBoundary;
