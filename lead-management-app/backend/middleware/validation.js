const { body, param, query } = require('express-validator');

/**
 * Validation middleware using express-validator
 * These run before the controller functions
 */

/**
 * Validation rules for creating a new lead
 */
const validateCreateLead = [
  // Support both old (name) and new (firstName/lastName) formats
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes')
    .trim()
    .escape(),

  body('firstName')
    .optional()
    .isLength({ min: 2, max: 25 })
    .withMessage('First name must be between 2 and 25 characters')
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes')
    .trim()
    .escape(),

  body('lastName')
    .optional()
    .isLength({ min: 2, max: 25 })
    .withMessage('Last name must be between 2 and 25 characters')
    .matches(/^[a-zA-Z\s\-']+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes')
    .trim()
    .escape(),

  // Custom validation to ensure either name or firstName+lastName is provided
  body().custom((body) => {
    if (!body.name && (!body.firstName || !body.lastName)) {
      throw new Error('Either name or both firstName and lastName are required');
    }
    return true;
  }),

  body('company')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters')
    .trim()
    .escape(),

  body('source')
    .optional()
    .isIn(['website', 'linkedin', 'referral', 'cold-call', 'email'])
    .withMessage('Source must be one of: website, linkedin, referral, cold-call, email'),

  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .isLength({ max: 100 })
    .withMessage('Email cannot exceed 100 characters')
    .normalizeEmail()
    .trim(),

  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .custom((value) => {
      // Remove all non-digit characters for validation
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        throw new Error('Phone number must contain 10-15 digits');
      }
      return true;
    })
    .trim(),

  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
    .trim()
    .escape()
];

/**
 * Validation rules for updating lead status
 */
const validateUpdateStatus = [
  param('id')
    .isMongoId()
    .withMessage('Invalid lead ID format'),

  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['new', 'connected', 'qualified', 'converted'])
    .withMessage('Status must be one of: new, connected, qualified, converted'),

  body('notes')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Status change notes cannot exceed 200 characters')
    .trim()
    .escape()
];

/**
 * Validation rules for getting lead by ID
 */
const validateLeadId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid lead ID format')
];

/**
 * Validation rules for query parameters
 */
const validateLeadQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),

  query('status')
    .optional()
    .isIn(['new', 'connected', 'qualified', 'converted'])
    .withMessage('Status must be one of: new, connected, qualified, converted'),

  query('search')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Search term must be between 1 and 50 characters')
    .trim()
    .escape()
];

/**
 * Validation rules for bulk status update
 */
const validateBulkStatusUpdate = [
  body('leadIds')
    .notEmpty()
    .withMessage('leadIds array is required')
    .isArray({ min: 1, max: 100 })
    .withMessage('leadIds must be an array with 1-100 items'),

  body('leadIds.*')
    .isMongoId()
    .withMessage('Each lead ID must be a valid MongoDB ObjectId'),

  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['new', 'connected', 'qualified', 'converted'])
    .withMessage('Status must be one of: new, connected, qualified, converted'),

  body('notes')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Notes cannot exceed 200 characters')
    .trim()
    .escape()
];

/**
 * Custom validation middleware
 * Additional business logic validations
 */
const customValidations = {
  /**
   * Check if email domain is allowed
   * (Example of custom business logic)
   */
  allowedEmailDomains: body('email').custom(async (email) => {
    // Example: Only allow certain domains for enterprise use
    const blockedDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
    const domain = email.split('@')[1];
    
    if (blockedDomains.includes(domain)) {
      throw new Error('Email domain is not allowed');
    }
    
    return true;
  }),

  /**
   * Check phone number country code
   * (Example of region-specific validation)
   */
  validatePhoneRegion: body('phone').custom((phone) => {
    // Example: Ensure phone starts with country code for international leads
    const hasCountryCode = phone.startsWith('+');
    const digitsOnly = phone.replace(/\D/g, '');
    
    // If more than 10 digits, assume international format
    if (digitsOnly.length > 10 && !hasCountryCode) {
      throw new Error('International phone numbers must include country code (e.g., +1)');
    }
    
    return true;
  })
};

/**
 * Sanitization middleware
 * Additional sanitization after validation
 */
const sanitizeInputs = (req, res, next) => {
  if (req.body) {
    // Additional sanitization for specific fields
    if (req.body.name) {
      req.body.name = req.body.name.replace(/\s+/g, ' ').trim();
    }
    
    if (req.body.firstName) {
      req.body.firstName = req.body.firstName.replace(/\s+/g, ' ').trim();
    }
    
    if (req.body.lastName) {
      req.body.lastName = req.body.lastName.replace(/\s+/g, ' ').trim();
    }
    
    if (req.body.company) {
      req.body.company = req.body.company.replace(/\s+/g, ' ').trim();
    }
    
    if (req.body.phone) {
      // Standardize phone format
      req.body.phone = req.body.phone.replace(/[^\d+()-\s]/g, '');
    }
  }
  
  next();
};

module.exports = {
  validateCreateLead,
  validateUpdateStatus,
  validateLeadId,
  validateLeadQuery,
  validateBulkStatusUpdate,
  customValidations,
  sanitizeInputs
};
