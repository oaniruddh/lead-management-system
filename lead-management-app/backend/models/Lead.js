const mongoose = require('mongoose');

/**
 * Lead Schema Definition
 * Defines the structure and validation rules for lead documents
 */
const leadSchema = new mongoose.Schema({
  // Support both combined name and separate first/last names
  name: {
    type: String,
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
    validate: {
      validator: function(v) {
        // If name is provided, validate it
        if (v) {
          return /^[a-zA-Z\s\-']+$/.test(v);
        }
        // If no name, check if firstName and lastName are provided
        if (!v && (!this.firstName || !this.lastName)) {
          return false;
        }
        return true;
      },
      message: 'Either name or both firstName and lastName are required'
    }
  },
  
  firstName: {
    type: String,
    trim: true,
    minlength: [2, 'First name must be at least 2 characters long'],
    maxlength: [25, 'First name cannot exceed 25 characters'],
    validate: {
      validator: function(v) {
        if (v) {
          return /^[a-zA-Z\s\-']+$/.test(v);
        }
        return true;
      },
      message: 'First name can only contain letters, spaces, hyphens, and apostrophes'
    }
  },
  
  lastName: {
    type: String,
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters long'],
    maxlength: [25, 'Last name cannot exceed 25 characters'],
    validate: {
      validator: function(v) {
        if (v) {
          return /^[a-zA-Z\s\-']+$/.test(v);
        }
        return true;
      },
      message: 'Last name can only contain letters, spaces, hyphens, and apostrophes'
    }
  },
  
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true, // Convert to lowercase
    maxlength: [100, 'Email cannot exceed 100 characters'],
    validate: {
      validator: function(v) {
        // Enhanced email validation regex
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
      },
      message: 'Please enter a valid email address'
    },
    // Create index for faster queries and uniqueness
    index: true,
    unique: true
  },
  
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    validate: {
      validator: function(v) {
        // Remove all non-digit characters for validation
        const digitsOnly = v.replace(/\D/g, '');
        // Allow 10-15 digits (covers most international formats)
        return digitsOnly.length >= 10 && digitsOnly.length <= 15;
      },
      message: 'Phone number must contain 10-15 digits'
    }
  },
  
  status: {
    type: String,
    enum: ['new', 'connected', 'qualified', 'converted'],
    default: 'new'
  },
  
  // Track status change history for audit trail
  statusHistory: [{
    status: {
      type: String,
      enum: ['new', 'connected', 'qualified', 'converted'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      maxlength: [200, 'Status change notes cannot exceed 200 characters']
    }
  }],
  
  // Timestamps for each status change
  statusTimestamps: {
    connectedAt: Date,
    qualifiedAt: Date,
    convertedAt: Date
  },
  
  source: {
    type: String,
    enum: ['website', 'linkedin', 'referral', 'cold-call', 'email'],
    default: 'website'
  },
  
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    trim: true
  }
}, {
  // Add timestamps automatically
  timestamps: true,
  
  // Transform output when converting to JSON
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

/**
 * Pre-save middleware
 * Runs before saving a document to the database
 */
leadSchema.pre('save', function(next) {
  // Normalize phone number format
  if (this.phone) {
    // Remove all non-digit characters except + at the beginning
    this.phone = this.phone.replace(/(?!^\+)\D/g, '');
  }
  
  // Auto-generate name from firstName and lastName if not provided
  if (!this.name && this.firstName && this.lastName) {
    this.name = `${this.firstName} ${this.lastName}`;
  }
  
  // Capitalize names
  const capitalizeWords = (str) => {
    return str.replace(/\b\w+/g, function(word) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    });
  };
  
  if (this.name) {
    this.name = capitalizeWords(this.name);
  }
  if (this.firstName) {
    this.firstName = capitalizeWords(this.firstName);
  }
  if (this.lastName) {
    this.lastName = capitalizeWords(this.lastName);
  }
  if (this.company) {
    this.company = this.company.trim();
  }
  
  // Handle status changes and history tracking
  if (this.isModified('status') || this.isNew) {
    const currentStatus = this.status;
    const now = new Date();
    
    // Initialize statusHistory if this is a new document
    if (this.isNew) {
      this.statusHistory = [{
        status: currentStatus,
        timestamp: now
      }];
    } else {
      // Add new status to history if status changed
      const historyEntry = {
        status: currentStatus,
        timestamp: now
      };
      
      // Add notes if provided via updateStatus method
      if (this._statusNotes) {
        historyEntry.notes = this._statusNotes;
        delete this._statusNotes; // Clean up temporary property
      }
      
      this.statusHistory.push(historyEntry);
    }
    
    // Update status timestamps
    if (!this.statusTimestamps) {
      this.statusTimestamps = {};
    }
    
    switch (currentStatus) {
      case 'connected':
        if (!this.statusTimestamps.connectedAt) {
          this.statusTimestamps.connectedAt = now;
        }
        break;
      case 'qualified':
        if (!this.statusTimestamps.qualifiedAt) {
          this.statusTimestamps.qualifiedAt = now;
        }
        break;
      case 'converted':
        if (!this.statusTimestamps.convertedAt) {
          this.statusTimestamps.convertedAt = now;
        }
        break;
    }
  }
  
  next();
});

/**
 * Static methods
 */
leadSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

leadSchema.statics.getLeadStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Get detailed lead progression analytics
leadSchema.statics.getLeadProgressionStats = function() {
  return this.aggregate([
    {
      $facet: {
        // Basic status counts
        statusCounts: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ],
        
        // Conversion funnel (leads that moved through each stage)
        conversionFunnel: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              connected: {
                $sum: {
                  $cond: [{
                    $or: [
                      { $eq: ['$status', 'connected'] },
                      { $eq: ['$status', 'qualified'] },
                      { $eq: ['$status', 'converted'] }
                    ]
                  }, 1, 0]
                }
              },
              qualified: {
                $sum: {
                  $cond: [{
                    $or: [
                      { $eq: ['$status', 'qualified'] },
                      { $eq: ['$status', 'converted'] }
                    ]
                  }, 1, 0]
                }
              },
              converted: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'converted'] }, 1, 0]
                }
              }
            }
          }
        ],
        
        // Average time between status changes
        averageProgressionTimes: [
          {
            $match: {
              $or: [
                { 'statusTimestamps.connectedAt': { $exists: true } },
                { 'statusTimestamps.qualifiedAt': { $exists: true } },
                { 'statusTimestamps.convertedAt': { $exists: true } }
              ]
            }
          },
          {
            $group: {
              _id: null,
              avgTimeToConnect: {
                $avg: {
                  $cond: [
                    { $and: [{ $ne: ['$statusTimestamps.connectedAt', null] }] },
                    { $subtract: ['$statusTimestamps.connectedAt', '$createdAt'] },
                    null
                  ]
                }
              },
              avgTimeToQualify: {
                $avg: {
                  $cond: [
                    { $and: [{ $ne: ['$statusTimestamps.qualifiedAt', null] }] },
                    { $subtract: ['$statusTimestamps.qualifiedAt', '$createdAt'] },
                    null
                  ]
                }
              },
              avgTimeToConvert: {
                $avg: {
                  $cond: [
                    { $and: [{ $ne: ['$statusTimestamps.convertedAt', null] }] },
                    { $subtract: ['$statusTimestamps.convertedAt', '$createdAt'] },
                    null
                  ]
                }
              }
            }
          }
        ]
      }
    }
  ]);
};

/**
 * Instance methods
 */
leadSchema.methods.updateStatus = function(newStatus, notes = null) {
  const validStatuses = ['new', 'connected', 'qualified', 'converted'];
  
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}. Must be one of: ${validStatuses.join(', ')}`);
  }
  
  this.status = newStatus;
  
  // Add notes to the latest status history entry if provided
  if (notes && this.statusHistory && this.statusHistory.length > 0) {
    // We'll add the notes when the pre-save middleware runs
    this._statusNotes = notes;
  }
  
  return this.save();
};

// Method to get status progression metrics for this lead
leadSchema.methods.getProgressionMetrics = function() {
  if (!this.statusHistory || this.statusHistory.length === 0) {
    return null;
  }
  
  const metrics = {
    totalProgressions: this.statusHistory.length - 1, // Exclude initial 'new' status
    timeInEachStatus: {},
    currentStatusDuration: null
  };
  
  // Calculate time spent in each status
  for (let i = 0; i < this.statusHistory.length; i++) {
    const current = this.statusHistory[i];
    const next = this.statusHistory[i + 1];
    
    if (next) {
      const timeSpent = next.timestamp - current.timestamp;
      metrics.timeInEachStatus[current.status] = timeSpent;
    } else {
      // Current status duration
      metrics.currentStatusDuration = new Date() - current.timestamp;
    }
  }
  
  return metrics;
};

// Create and export the model
const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead;