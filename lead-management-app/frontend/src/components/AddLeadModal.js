import React, { useState } from 'react';
import { X, UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { validateLeadForm, validateField } from '../utils/validation';

const AddLeadModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    source: 'website'
  });
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (touched[name]) {
      const validation = validateField(name, value, formData);
      setErrors(prev => ({
        ...prev,
        [name]: validation.error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const validation = validateField(name, value, formData);
    setErrors(prev => ({
      ...prev,
      [name]: validation.error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create combined name for validation
    const validationData = {
      ...formData,
      name: `${formData.firstName} ${formData.lastName}`.trim()
    };
    
    const validation = validateLeadForm(validationData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      setTouched({
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        company: true
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      
      // Reset form on success
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        source: 'website'
      });
      setErrors({});
      setTouched({});
      onClose();
      
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClasses = (fieldName) => {
    const baseClasses = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200';
    const errorClasses = errors[fieldName] && touched[fieldName] ? 'border-red-500 focus:ring-red-500' : 'border-gray-300';
    return `${baseClasses} ${errorClasses}`;
  };

  const isFormLoading = loading || isSubmitting;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Lead</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isFormLoading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={getInputClasses('firstName')}
              placeholder="Enter first name"
              disabled={isFormLoading}
            />
            {errors.firstName && touched.firstName && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.firstName}</span>
              </div>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={getInputClasses('lastName')}
              placeholder="Enter last name"
              disabled={isFormLoading}
            />
            {errors.lastName && touched.lastName && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.lastName}</span>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={getInputClasses('email')}
              placeholder="Enter email address"
              disabled={isFormLoading}
            />
            {errors.email && touched.email && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          {/* Phone Number */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={getInputClasses('phone')}
              placeholder="Enter phone number"
              disabled={isFormLoading}
            />
            {errors.phone && touched.phone && (
              <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.phone}</span>
              </div>
            )}
          </div>

          {/* Company */}
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={getInputClasses('company')}
              placeholder="Enter company name"
              disabled={isFormLoading}
            />
          </div>

          {/* Source */}
          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-1">
              Source
            </label>
            <select
              id="source"
              name="source"
              value={formData.source}
              onChange={handleInputChange}
              className={getInputClasses('source')}
              disabled={isFormLoading}
            >
              <option value="website">Website</option>
              <option value="linkedin">LinkedIn</option>
              <option value="referral">Referral</option>
              <option value="cold-call">Cold Call</option>
              <option value="email">Email Campaign</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isFormLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isFormLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Adding Lead...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Submit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeadModal;