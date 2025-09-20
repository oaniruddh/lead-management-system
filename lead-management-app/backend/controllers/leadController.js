const Lead = require('../models/Lead');
const { validationResult } = require('express-validator');
const { sanitizeInput } = require('../utils/validators');

/**
 * Lead Controller
 * Contains all business logic for lead operations
 */

/**
 * Create a new lead
 * POST /api/leads
 */
const createLead = async (req, res) => {
  try {
    // Check for validation errors from middleware
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg,
          value: error.value
        }))
      });
    }

    // Extract and sanitize input data
    const { name, firstName, lastName, email, phone, company, source, notes } = req.body;
    
    const sanitizedData = {
      // Support both old (name) and new (firstName/lastName) formats
      name: name ? sanitizeInput(name) : undefined,
      firstName: firstName ? sanitizeInput(firstName) : undefined,
      lastName: lastName ? sanitizeInput(lastName) : undefined,
      email: sanitizeInput(email),
      phone: sanitizeInput(phone),
      company: company ? sanitizeInput(company) : undefined,
      source: source || 'website',
      notes: notes ? sanitizeInput(notes) : undefined
    };

    // Check if lead with this email already exists
    const existingLead = await Lead.findByEmail(sanitizedData.email);
    if (existingLead) {
      return res.status(409).json({
        success: false,
        message: 'A lead with this email already exists',
        field: 'email'
      });
    }

    // Create new lead
    const newLead = new Lead(sanitizedData);
    const savedLead = await newLead.save();

    // Return success response with created lead
    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: savedLead
    });

  } catch (error) {
    console.error('Create lead error:', error);

    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `A lead with this ${field} already exists`,
        field: field
      });
    }

    // Handle validation errors from Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating lead'
    });
  }
};

/**
 * Get all leads
 * GET /api/leads
 */
const getAllLeads = async (req, res) => {
  try {
    // Parse query parameters for pagination and filtering
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const search = req.query.search;

    // Build query object
    const query = {};
    
    // Filter by status if provided
    if (status && ['new', 'connected', 'qualified', 'converted'].includes(status)) {
      query.status = status;
    }

    // Add search functionality (search in name, firstName, lastName, email, and company)
    if (search) {
      const searchRegex = new RegExp(sanitizeInput(search), 'i');
      query.$or = [
        { name: searchRegex },
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { company: searchRegex }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries
    const [leads, totalCount] = await Promise.all([
      Lead.find(query)
        .sort({ createdAt: -1 }) // Most recent first
        .skip(skip)
        .limit(limit)
        .lean(), // Return plain JavaScript objects for better performance
      Lead.countDocuments(query)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      message: 'Leads retrieved successfully',
      data: {
        leads,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPrevPage
        }
      }
    });

  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving leads'
    });
  }
};

/**
 * Get a single lead by ID
 * GET /api/leads/:id
 */
const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find lead by ID
    const lead = await Lead.findById(id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead retrieved successfully',
      data: lead
    });

  } catch (error) {
    console.error('Get lead by ID error:', error);

    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid lead ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving lead'
    });
  }
};

/**
 * Update lead status
 * PATCH /api/leads/:id/status
 */
const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = ['new', 'connected', 'qualified', 'converted'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    // Find and update lead
    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Check if this is a valid status transition (optional business logic)
    const currentStatus = lead.status;
    const statusOrder = ['new', 'connected', 'qualified', 'converted'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const newIndex = statusOrder.indexOf(status);

    // Allow backward movement but log it
    if (newIndex < currentIndex) {
      console.log(`Lead ${id}: Status moved backward from ${currentStatus} to ${status}`);
    }

    // Update status using instance method with notes
    await lead.updateStatus(status, notes);

    res.status(200).json({
      success: true,
      message: 'Lead status updated successfully',
      data: {
        ...lead.toJSON(),
        progressionMetrics: lead.getProgressionMetrics()
      }
    });

  } catch (error) {
    console.error('Update lead status error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid lead ID format'
      });
    }

    // Handle validation errors from the model
    if (error.message && error.message.includes('Invalid status')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while updating lead status'
    });
  }
};

/**
 * Delete a lead
 * DELETE /api/leads/:id
 */
const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete lead
    const deletedLead = await Lead.findByIdAndDelete(id);
    
    if (!deletedLead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully',
      data: deletedLead
    });

  } catch (error) {
    console.error('Delete lead error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid lead ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting lead'
    });
  }
};

/**
 * Get lead statistics
 * GET /api/leads/stats
 */
const getLeadStats = async (req, res) => {
  try {
    // Get stats using model static method
    const stats = await Lead.getLeadStats();
    
    // Format stats for easier consumption
    const formattedStats = {
      total: 0,
      byStatus: {}
    };

    stats.forEach(stat => {
      formattedStats.total += stat.count;
      formattedStats.byStatus[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      message: 'Lead statistics retrieved successfully',
      data: formattedStats
    });

  } catch (error) {
    console.error('Get lead stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving statistics'
    });
  }
};

/**
 * Get detailed lead progression analytics
 * GET /api/leads/analytics
 */
const getLeadProgressionAnalytics = async (req, res) => {
  try {
    // Get detailed progression analytics
    const analytics = await Lead.getLeadProgressionStats();
    
    if (!analytics || analytics.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No lead data available for analytics',
        data: {
          statusCounts: [],
          conversionFunnel: {
            total: 0,
            connected: 0,
            qualified: 0,
            converted: 0,
            conversionRates: {
              newToConnected: 0,
              connectedToQualified: 0,
              qualifiedToConverted: 0,
              overallConversion: 0
            }
          },
          averageProgressionTimes: {
            avgTimeToConnect: null,
            avgTimeToQualify: null,
            avgTimeToConvert: null
          }
        }
      });
    }

    const result = analytics[0];
    const funnel = result.conversionFunnel[0] || { total: 0, connected: 0, qualified: 0, converted: 0 };
    const times = result.averageProgressionTimes[0] || {};

    // Calculate conversion rates
    const conversionRates = {
      newToConnected: funnel.total > 0 ? (funnel.connected / funnel.total * 100).toFixed(2) : 0,
      connectedToQualified: funnel.connected > 0 ? (funnel.qualified / funnel.connected * 100).toFixed(2) : 0,
      qualifiedToConverted: funnel.qualified > 0 ? (funnel.converted / funnel.qualified * 100).toFixed(2) : 0,
      overallConversion: funnel.total > 0 ? (funnel.converted / funnel.total * 100).toFixed(2) : 0
    };

    // Convert milliseconds to more readable format for average times
    const formatTime = (ms) => {
      if (!ms) return null;
      const hours = Math.round(ms / (1000 * 60 * 60));
      if (hours < 24) return `${hours} hours`;
      const days = Math.round(hours / 24);
      return `${days} days`;
    };

    res.status(200).json({
      success: true,
      message: 'Lead progression analytics retrieved successfully',
      data: {
        statusCounts: result.statusCounts,
        conversionFunnel: {
          ...funnel,
          conversionRates
        },
        averageProgressionTimes: {
          avgTimeToConnect: formatTime(times.avgTimeToConnect),
          avgTimeToQualify: formatTime(times.avgTimeToQualify),
          avgTimeToConvert: formatTime(times.avgTimeToConvert),
          raw: times // Include raw milliseconds for programmatic use
        }
      }
    });

  } catch (error) {
    console.error('Get lead progression analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving progression analytics'
    });
  }
};

/**
 * Get status history for a specific lead
 * GET /api/leads/:id/history
 */
const getLeadStatusHistory = async (req, res) => {
  try {
    const { id } = req.params;

    // Find lead by ID
    const lead = await Lead.findById(id).select('name email status statusHistory statusTimestamps');
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead status history retrieved successfully',
      data: {
        leadInfo: {
          id: lead._id,
          name: lead.name,
          email: lead.email,
          currentStatus: lead.status
        },
        statusHistory: lead.statusHistory || [],
        statusTimestamps: lead.statusTimestamps || {},
        progressionMetrics: lead.getProgressionMetrics()
      }
    });

  } catch (error) {
    console.error('Get lead status history error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid lead ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving status history'
    });
  }
};

/**
 * Bulk update lead statuses
 * PUT /api/leads/bulk-status
 */
const bulkUpdateLeadStatus = async (req, res) => {
  try {
    const { leadIds, status, notes } = req.body;

    // Validate input
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'leadIds array is required and must not be empty'
      });
    }

    const validStatuses = ['new', 'connected', 'qualified', 'converted'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    // Limit bulk operations to prevent abuse
    if (leadIds.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update more than 100 leads at once'
      });
    }

    // Find all leads
    const leads = await Lead.find({ _id: { $in: leadIds } });
    
    if (leads.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No leads found with the provided IDs'
      });
    }

    // Update each lead's status
    const updateResults = [];
    const errors = [];

    for (const lead of leads) {
      try {
        await lead.updateStatus(status, notes);
        updateResults.push({
          id: lead._id,
          name: lead.name,
          email: lead.email,
          oldStatus: lead.status,
          newStatus: status,
          success: true
        });
      } catch (error) {
        errors.push({
          id: lead._id,
          name: lead.name,
          email: lead.email,
          error: error.message,
          success: false
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk status update completed. ${updateResults.length} successful, ${errors.length} failed.`,
      data: {
        successful: updateResults,
        failed: errors,
        summary: {
          requested: leadIds.length,
          found: leads.length,
          successful: updateResults.length,
          failed: errors.length
        }
      }
    });

  } catch (error) {
    console.error('Bulk update lead status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating lead statuses'
    });
  }
};

module.exports = {
  createLead,
  getAllLeads,
  getLeadById,
  updateLeadStatus,
  deleteLead,
  getLeadStats,
  getLeadProgressionAnalytics,
  getLeadStatusHistory,
  bulkUpdateLeadStatus
};
