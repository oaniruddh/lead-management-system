import axios from 'axios';
import toast from 'react-hot-toast';

/**
 * API Service Configuration
 * Centralized HTTP client for all API communications
 */

// Create axios instance with default configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

/**
 * Request Interceptor
 * Add common headers, authentication tokens, etc.
 */
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching issues
    config.metadata = { startTime: new Date() };
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🌐 API Request:', {
        method: config.method.toUpperCase(),
        url: config.url,
        data: config.data
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handle common response patterns, errors, etc.
 */
api.interceptors.response.use(
  (response) => {
    // Calculate request duration
    const duration = new Date() - response.config.metadata.startTime;
    
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(' API Response:', {
        method: response.config.method.toUpperCase(),
        url: response.config.url,
        status: response.status,
        duration: `${duration}ms`,
        data: response.data
      });
    }
    
    return response;
  },
  (error) => {
    // Calculate request duration for failed requests
    if (error.config?.metadata) {
      const duration = new Date() - error.config.metadata.startTime;
      console.log(' API Error:', {
        method: error.config.method?.toUpperCase(),
        url: error.config.url,
        duration: `${duration}ms`,
        error: error.message
      });
    }
    
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          // Validation errors
          if (data.errors && Array.isArray(data.errors)) {
            const errorMessages = data.errors.map(err => err.message).join(', ');
            toast.error(`Validation Error: ${errorMessages}`);
          } else {
            toast.error(data.message || 'Invalid request');
          }
          break;
          
        case 404:
          toast.error('Resource not found');
          break;
          
        case 409:
          // Conflict (e.g., duplicate email)
          toast.error(data.message || 'Conflict error');
          break;
          
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
          
        case 500:
          toast.error('Server error. Please try again later.');
          break;
          
        default:
          toast.error(data.message || 'An unexpected error occurred');
      }
    } else if (error.request) {
      // Network error (no response received)
      console.error('Network error:', error.request);
      toast.error('Network error. Please check your connection.');
    } else {
      // Something else happened
      console.error('Request setup error:', error.message);
      toast.error('Request failed. Please try again.');
    }
    
    return Promise.reject(error);
  }
);

/**
 * Lead API Functions
 */
export const leadAPI = {
  /**
   * Create a new lead
   * @param {Object} leadData - Lead information
   * @returns {Promise} API response
   */
  create: async (leadData) => {
    const response = await api.post('/leads', leadData);
    
    // Show success message
    toast.success('Lead created successfully!');
    
    return response.data;
  },

  /**
   * Get all leads with optional filters
   * @param {Object} params - Query parameters (page, limit, search, status)
   * @returns {Promise} API response
   */
  getAll: async (params = {}) => {
    const response = await api.get('/leads', { params });
    return response.data;
  },

  /**
   * Get a single lead by ID
   * @param {string} id - Lead ID
   * @returns {Promise} API response
   */
  getById: async (id) => {
    const response = await api.get(`/leads/${id}`);
    return response.data;
  },

  /**
   * Update lead status
   * @param {string} id - Lead ID
   * @param {string} status - New status
   * @param {string} notes - Optional notes for the status change
   * @returns {Promise} API response
   */
  updateStatus: async (id, status, notes = null) => {
    const payload = { status };
    if (notes) {
      payload.notes = notes;
    }
    
    const response = await api.patch(`/leads/${id}/status`, payload);
    
    toast.success('Lead status updated!');
    
    return response.data;
  },

  /**
   * Delete a lead
   * @param {string} id - Lead ID
   * @returns {Promise} API response
   */
  delete: async (id) => {
    const response = await api.delete(`/leads/${id}`);
    
    toast.success('Lead deleted successfully!');
    
    return response.data;
  },

  /**
   * Get lead statistics
   * @returns {Promise} API response
   */
  getStats: async () => {
    const response = await api.get('/leads/stats');
    return response.data;
  },

  /**
   * Get detailed lead progression analytics
   * @returns {Promise} API response
   */
  getAnalytics: async () => {
    const response = await api.get('/leads/analytics');
    return response.data;
  },

  /**
   * Get status history for a specific lead
   * @param {string} id - Lead ID
   * @returns {Promise} API response
   */
  getStatusHistory: async (id) => {
    const response = await api.get(`/leads/${id}/history`);
    return response.data;
  },

  /**
   * Bulk update lead statuses
   * @param {Array} leadIds - Array of lead IDs
   * @param {string} status - New status
   * @param {string} notes - Optional notes
   * @returns {Promise} API response
   */
  bulkUpdateStatus: async (leadIds, status, notes = null) => {
    const payload = { leadIds, status };
    if (notes) {
      payload.notes = notes;
    }
    
    const response = await api.put('/leads/bulk-status', payload);
    
    toast.success(`Bulk update completed: ${response.data.data.summary.successful} leads updated`);
    
    return response.data;
  }
};

/**
 * Health check function
 * @returns {Promise} API response
 */
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

/**
 * Generic API utility functions
 */
export const apiUtils = {
  /**
   * Check if error is a network error
   * @param {Error} error - Error object
   * @returns {boolean}
   */
  isNetworkError: (error) => {
    return !error.response && error.request;
  },

  /**
   * Check if error is a validation error
   * @param {Error} error - Error object
   * @returns {boolean}
   */
  isValidationError: (error) => {
    return error.response?.status === 400;
  },

  /**
   * Extract validation errors from API response
   * @param {Error} error - Error object
   * @returns {Array} Array of validation errors
   */
  getValidationErrors: (error) => {
    if (error.response?.data?.errors) {
      return error.response.data.errors;
    }
    return [];
  }
};

export default api;