import React, { useState } from 'react';
import { UserPlus, Loader2, AlertCircle } from 'lucide-react';
import { validateLeadForm, validateField } from '../utils/validation';

const LeadForm = ({ onSubmit, loading = false, className = '' }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
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
    
    const validation = validateLeadForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      setTouched({
        name: true,
        email: true,
        phone: true,
        notes: true
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        notes: ''
      });
      setErrors({});
      setTouched({});
      
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClasses = (fieldName) => {
    const baseClasses = 'input-field';
    const errorClasses = errors[fieldName] && touched[fieldName] ? 'input-error' : '';
    return `${baseClasses} ${errorClasses}`.trim();
  };

  const isFormLoading = loading || isSubmitting;

  return (
    <div className={`card p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <UserPlus className="w-5 h-5 text-primary-600" />
        <h2 className="text-xl font-semibold text-gray-900">Add New Lead</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={getInputClasses('name')}
            placeholder="Enter full name"
            disabled={isFormLoading}
          />
          {errors.name && touched.name && (
            <div className="flex items-center gap-1 mt-1 text-sm text-danger-600">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.name}</span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
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
            <div className="flex items-center gap-1 mt-1 text-sm text-danger-600">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.email}</span>
            </div>
          )}
        </div>

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
            <div className="flex items-center gap-1 mt-1 text-sm text-danger-600">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.phone}</span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            onBlur={handleBlur}
            rows={3}
            className={getInputClasses('notes')}
            placeholder="Additional notes or comments"
            disabled={isFormLoading}
          />
          {errors.notes && touched.notes && (
            <div className="flex items-center gap-1 mt-1 text-sm text-danger-600">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.notes}</span>
            </div>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isFormLoading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isFormLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Adding Lead...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Add Lead</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-4 text-xs text-gray-500">
        <p>* Required fields</p>
        <p>All lead information is validated and securely stored.</p>
      </div>
    </div>
  );
};

export default LeadForm;