const express = require('express');
const router = express.Router();

// Import controllers
const {
  createLead,
  getAllLeads,
  getLeadById,
  updateLeadStatus,
  deleteLead,
  getLeadStats,
  getLeadProgressionAnalytics,
  getLeadStatusHistory,
  bulkUpdateLeadStatus
} = require('../controllers/leadController');

// Import validation middleware
const {
  validateCreateLead,
  validateUpdateStatus,
  validateLeadId,
  validateLeadQuery,
  validateBulkStatusUpdate,
  sanitizeInputs
} = require('../middleware/validation');

// Import error handling utilities
const { catchAsync } = require('../middleware/errorHandler');

/**
 * Lead Routes
 * All routes are prefixed with /api/leads
 */

/**
 * @route   GET /api/leads/stats
 * @desc    Get lead statistics
 * @access  Public (can be made private later)
 * @note    This route must come BEFORE /:id route to avoid conflict
 */
router.get('/stats', catchAsync(getLeadStats));

/**
 * @route   GET /api/leads/analytics
 * @desc    Get detailed lead progression analytics
 * @access  Public (can be made private later)
 * @note    This route must come BEFORE /:id route to avoid conflict
 */
router.get('/analytics', catchAsync(getLeadProgressionAnalytics));

/**
 * @route   PUT /api/leads/bulk-status
 * @desc    Bulk update lead statuses
 * @access  Public (should be made private in production)
 * @body    { leadIds: Array<string>, status: string, notes?: string }
 */
router.put('/bulk-status', 
  validateBulkStatusUpdate,
  sanitizeInputs,
  catchAsync(bulkUpdateLeadStatus)
);

/**
 * @route   POST /api/leads
 * @desc    Create a new lead
 * @access  Public
 * @body    { name: String, email: String, phone: String, notes?: String }
 */
router.post('/', 
  validateCreateLead,
  sanitizeInputs,
  catchAsync(createLead)
);

/**
 * @route   GET /api/leads
 * @desc    Get all leads with optional filtering and pagination
 * @access  Public
 * @query   page?, limit?, status?, search?
 */
router.get('/',
  validateLeadQuery,
  catchAsync(getAllLeads)
);

/**
 * @route   GET /api/leads/:id
 * @desc    Get a single lead by ID
 * @access  Public
 * @params  id: MongoDB ObjectId
 */
router.get('/:id',
  validateLeadId,
  catchAsync(getLeadById)
);

/**
 * @route   GET /api/leads/:id/history
 * @desc    Get status history for a specific lead
 * @access  Public
 * @params  id: MongoDB ObjectId
 */
router.get('/:id/history',
  validateLeadId,
  catchAsync(getLeadStatusHistory)
);

/**
 * @route   PATCH /api/leads/:id/status
 * @desc    Update lead status
 * @access  Public (can be made private later)
 * @params  id: MongoDB ObjectId
 * @body    { status: String }
 */
router.patch('/:id/status',
  validateUpdateStatus,
  sanitizeInputs,
  catchAsync(updateLeadStatus)
);

/**
 * @route   DELETE /api/leads/:id
 * @desc    Delete a lead
 * @access  Public (should be made private in production)
 * @params  id: MongoDB ObjectId
 */
router.delete('/:id',
  validateLeadId,
  catchAsync(deleteLead)
);

/**
 * Health check route for this module
 * @route   GET /api/leads/health
 * @desc    Check if leads API is working
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Leads API is healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;