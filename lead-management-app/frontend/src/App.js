import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import LeadTable from './components/LeadTable';
import FilterBar from './components/FilterBar';
import AddLeadModal from './components/AddLeadModal';
import { useLeads } from './hooks/useLeads';
import { Users, Plus, Search } from 'lucide-react';

function App() {
  const { 
    leads, 
    loading, 
    error, 
    pagination, 
    createLead, 
    updateLeadStatus, 
    filters 
  } = useLeads();

  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentFilters, setCurrentFilters] = useState({ status: 'all', source: 'all' });

  const handleCreateLead = async (leadData) => {
    await createLead(leadData);
  };

  const handleFilterChange = (newFilters) => {
    setCurrentFilters(newFilters);
  };

  // Filter leads based on search term and filters
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchTerm || 
      (lead.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = currentFilters.status === 'all' || lead.status === currentFilters.status;
    const matchesSource = currentFilters.source === 'all' || lead.source === currentFilters.source;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Lead</h1>
              </div>
            </div>
            <button
              onClick={() => setIsAddLeadModalOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Lead
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filters */}
        <FilterBar 
          filters={currentFilters} 
          onFilterChange={handleFilterChange}
        />

        {/* Lead Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}
          
          <LeadTable 
            leads={filteredLeads} 
            loading={loading} 
            onStatusChange={updateLeadStatus}
          />
        </div>
      </main>

      {/* Add Lead Modal */}
      <AddLeadModal 
        isOpen={isAddLeadModalOpen}
        onClose={() => setIsAddLeadModalOpen(false)}
        onSubmit={handleCreateLead}
        loading={loading}
      />
    </div>
  );
}

export default App;
