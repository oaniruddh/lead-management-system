/**
 * Validation utility functions
 * These can be reused across different parts of the application
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidPhone = (phone) => {
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');
  // Allow 10-15 digits (covers most international formats)
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
};

/**
 * Validate name format
 * @param {string} name - Name to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidName = (name) => {
  // Allow letters, spaces, hyphens, and apostrophes
  // Must be between 2-50 characters
  const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
  return nameRegex.test(name);
};

/**
 * Sanitize input string
 * Remove potentially dangerous characters
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim() // Remove leading/trailing whitespace
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/[<>]/g, ''); // Remove < and > characters
};

/**
 * Check if string contains only allowed characters
 * @param {string} str - String to check
 * @param {RegExp} pattern - Allowed pattern
 * @returns {boolean} - True if valid, false otherwise
 */
const matchesPattern = (str, pattern) => {
  return pattern.test(str);
};

/**
 * Validate string length
 * @param {string} str - String to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidLength = (str, min, max) => {
  if (typeof str !== 'string') return false;
  const length = str.trim().length;
  return length >= min && length <= max;
};

/**
 * Format phone number for storage
 * @param {string} phone - Phone number to format
 * @returns {string} - Formatted phone number
 */
const formatPhoneNumber = (phone) => {
  // Remove all non-digit characters except + at the beginning
  return phone.replace(/(?!^\+)\D/g, '');
};

/**
 * Normalize email address
 * @param {string} email - Email to normalize
 * @returns {string} - Normalized email
 */
const normalizeEmail = (email) => {
  return email.toLowerCase().trim();
};

/**
 * Capitalize name properly
 * @param {string} name - Name to capitalize
 * @returns {string} - Properly capitalized name
 */
const capitalizeName = (name) => {
  return name.replace(/\b\w+/g, function(word) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
};

/**
 * Check if value exists and is not empty
 * @param {any} value - Value to check
 * @returns {boolean} - True if exists and not empty
 */
const isRequired = (value) => {
  return value !== undefined && value !== null && value.toString().trim() !== '';
};

module.exports = {
  isValidEmail,
  isValidPhone,
  isValidName,
  sanitizeInput,
  matchesPattern,
  isValidLength,
  formatPhoneNumber,
  normalizeEmail,
  capitalizeName,
  isRequired
};