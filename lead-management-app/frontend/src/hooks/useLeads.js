import { useState, useEffect, useCallback } from 'react';
import { leadAPI } from '../services/api';

/**
 * Custom hook for managing leads state
 * Provides CRUD operations and state management for leads
 */
export const useLeads = () => {
  // State management
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
    limit: 10
  });

  /**
   * Fetch leads with current filters
   */
  const fetchLeads = useCallback(async (customFilters = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = customFilters || filters;
      const response = await leadAPI.getAll(params);
      
      if (response.success) {
        setLeads(response.data.leads);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError(err.message || 'Failed to fetch leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Create a new lead
   */
  const createLead = useCallback(async (leadData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await leadAPI.create(leadData);
      
      if (response.success) {
        // Add new lead to the beginning of the list
        setLeads(prevLeads => [response.data, ...prevLeads]);
        
        // Update pagination count
        setPagination(prev => ({
          ...prev,
          totalCount: prev.totalCount + 1
        }));
        
        return response;
      }
    } catch (err) {
      console.error('Error creating lead:', err);
      setError(err.message || 'Failed to create lead');
      throw err; // Re-throw for form handling
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update lead status
   */
  const updateLeadStatus = useCallback(async (leadId, newStatus, notes = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await leadAPI.updateStatus(leadId, newStatus, notes);
      
      if (response.success) {
        // Update lead in the list with new data from response
        setLeads(prevLeads => 
          prevLeads.map(lead => {
            const leadIdToMatch = lead._id || lead.id;
            if (leadIdToMatch === leadId) {
              return {
                ...lead,
                ...response.data,
                updatedAt: new Date().toISOString()
              };
            }
            return lead;
          })
        );
        
        return response;
      }
    } catch (err) {
      console.error('Error updating lead status:', err);
      setError(err.message || 'Failed to update lead status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a lead
   */
  const deleteLead = useCallback(async (leadId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await leadAPI.delete(leadId);
      
      if (response.success) {
        // Remove lead from the list
        setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId));
        
        // Update pagination count
        setPagination(prev => ({
          ...prev,
          totalCount: prev.totalCount - 1
        }));
        
        return response;
      }
    } catch (err) {
      console.error('Error deleting lead:', err);
      setError(err.message || 'Failed to delete lead');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update filters and fetch leads
   */
  const updateFilters = useCallback((newFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 }; // Reset to page 1 when filtering
    setFilters(updatedFilters);
    fetchLeads(updatedFilters);
  }, [filters, fetchLeads]);

  /**
   * Change page
   */
  const changePage = useCallback((newPage) => {
    const updatedFilters = { ...filters, page: newPage };
    setFilters(updatedFilters);
    fetchLeads(updatedFilters);
  }, [filters, fetchLeads]);

  /**
   * Refresh leads (refetch current page)
   */
  const refreshLeads = useCallback(() => {
    fetchLeads();
  }, [fetchLeads]);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    const defaultFilters = {
      search: '',
      status: '',
      page: 1,
      limit: 10
    };
    setFilters(defaultFilters);
    fetchLeads(defaultFilters);
  }, [fetchLeads]);

  // Load leads on component mount
  useEffect(() => {
    fetchLeads();
  }, []); // Only run once on mount

  return {
    // State
    leads,
    loading,
    error,
    pagination,
    filters,
    
    // Actions
    createLead,
    updateLeadStatus,
    deleteLead,
    updateFilters,
    changePage,
    refreshLeads,
    clearFilters,
    fetchLeads
  };
};

/**
 * Custom hook for lead statistics
 */
export const useLeadStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    byStatus: {
      new: 0,
      connected: 0,
      qualified: 0,
      converted: 0
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await leadAPI.getStats();
      
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load stats on component mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refreshStats: fetchStats
  };
};
