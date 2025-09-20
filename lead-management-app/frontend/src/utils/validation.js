/**
 * Frontend Validation Utilities
 * Client-side validation functions that match backend validation
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
export const isValidPhone = (phone) => {
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  // Allow 10-15 digits (covers most international formats)
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
};

/**
 * Validate name format
 * @param {string} name - Name to validate
 * @returns {boolean} - True if valid
 */
export const isValidName = (name) => {
  // Allow letters, spaces, hyphens, and apostrophes
  // Must be between 2-50 characters
  const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
  return nameRegex.test(name);
};

/**
 * Validate required field
 * @param {any} value - Value to check
 * @returns {boolean} - True if valid
 */
export const isRequired = (value) => {
  return value !== undefined && value !== null && value.toString().trim() !== '';
};

/**
 * Validate string length
 * @param {string} str - String to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {boolean} - True if valid
 */
export const isValidLength = (str, min, max) => {
  if (typeof str !== 'string') return false;
  const length = str.trim().length;
  return length >= min && length <= max;
};

/**
 * Lead form validation
 * @param {Object} formData - Form data to validate
 * @returns {Object} - Validation result with errors
 */
export const validateLeadForm = (formData) => {
  const errors = {};
  const { name, email, phone, notes } = formData;

  // Name validation
  if (!isRequired(name)) {
    errors.name = 'Name is required';
  } else if (!isValidName(name)) {
    errors.name = 'Name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes';
  }

  // Email validation
  if (!isRequired(email)) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Please enter a valid email address';
  } else if (!isValidLength(email, 1, 100)) {
    errors.email = 'Email cannot exceed 100 characters';
  }

  // Phone validation
  if (!isRequired(phone)) {
    errors.phone = 'Phone number is required';
  } else if (!isValidPhone(phone)) {
    errors.phone = 'Phone number must contain 10-15 digits';
  }

  // Notes validation (optional field)
  if (notes && !isValidLength(notes, 0, 500)) {
    errors.notes = 'Notes cannot exceed 500 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Real-time field validation
 * Used for showing errors as user types
 */
export const validateField = (fieldName, value, formData = {}) => {
  const errors = {};

  switch (fieldName) {
    case 'name':
      if (!isRequired(value)) {
        errors.name = 'Name is required';
      } else if (!isValidName(value)) {
        errors.name = 'Name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes';
      }
      break;

    case 'email':
      if (!isRequired(value)) {
        errors.email = 'Email is required';
      } else if (!isValidEmail(value)) {
        errors.email = 'Please enter a valid email address';
      } else if (!isValidLength(value, 1, 100)) {
        errors.email = 'Email cannot exceed 100 characters';
      }
      break;

    case 'phone':
      if (!isRequired(value)) {
        errors.phone = 'Phone number is required';
      } else if (!isValidPhone(value)) {
        errors.phone = 'Phone number must contain 10-15 digits';
      }
      break;

    case 'notes':
      if (value && !isValidLength(value, 0, 500)) {
        errors.notes = 'Notes cannot exceed 500 characters';
      }
      break;

    default:
      break;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    error: errors[fieldName]
  };
};

/**
 * Format phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    // US format: (555) 123-4567
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    // US format with country code: +1 (555) 123-4567
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  } else {
    // International format: just add spaces every 3-4 digits
    return cleaned.replace(/(\d{1,4})/g, '$1 ').trim();
  }
};

/**
 * Sanitize input for display
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, ''); // Remove potential XSS characters
};

/**
 * Validation error messages
 * Centralized error messages for consistency
 */
export const ERROR_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_NAME: 'Name can only contain letters, spaces, hyphens, and apostrophes',
  TOO_LONG: (max) => `Cannot exceed ${max} characters`,
  TOO_SHORT: (min) => `Must be at least ${min} characters`,
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_FAILED: 'Please correct the errors below'
};

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  LEAD_CREATED: 'Lead created successfully!',
  LEAD_UPDATED: 'Lead updated successfully!',
  LEAD_DELETED: 'Lead deleted successfully!',
  STATUS_UPDATED: 'Lead status updated!'
};