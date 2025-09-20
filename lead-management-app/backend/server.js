// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import database connection
const connectDB = require('./config/database');

// Import routes
const leadRoutes = require('./routes/leadRoutes');

// Import middleware
const {
  globalErrorHandler,
  notFound,
  handleRateLimitError,
  handleCorsError,
  handleTimeout,
  handleJSONError
} = require('./middleware/errorHandler');

/**
 * Express Application Setup
 */
const app = express();

/**
 * Security Middleware
 */
// Enable trust proxy for accurate IP addresses behind reverse proxies
app.set('trust proxy', 1);

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: handleRateLimitError,
  skip: (req) => req.path === '/api/health'
});

app.use('/api/', limiter);

/**
 * CORS Configuration
 */
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(handleCorsError);

/**
 * Request Processing Middleware
 */
// Request timeout handling
app.use(handleTimeout);

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  type: 'application/json'
}));
app.use(express.urlencoded({ 
  extended: true,
  limit: '10mb'
}));

// JSON parsing error handling
app.use(handleJSONError);

/**
 * Request Logging (Development)
 */
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`, {
      body: req.body,
      query: req.query,
      params: req.params
    });
    next();
  });
}

/**
 * API Routes
 */
// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Lead management routes
app.use('/api/leads', leadRoutes);

// API documentation route (future enhancement)
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Lead Management API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      leads: {
        create: 'POST /api/leads',
        getAll: 'GET /api/leads',
        getById: 'GET /api/leads/:id',
        updateStatus: 'PATCH /api/leads/:id/status',
        delete: 'DELETE /api/leads/:id',
        stats: 'GET /api/leads/stats',
        analytics: 'GET /api/leads/analytics',
        statusHistory: 'GET /api/leads/:id/history',
        bulkUpdateStatus: 'PUT /api/leads/bulk-status'
      }
    },
    documentation: 'https://github.com/yourusername/lead-management-app'
  });
});

/**
 * Error Handling
 */
// Corrected undefined routes handling
app.use(notFound); // Use this instead of app.use('*', notFound);

// Global error handler (must be last)
app.use(globalErrorHandler);

/**
 * Server Startup
 */
const PORT = process.env.PORT || 5000;

// Graceful shutdown handler
process.on('SIGTERM', () => {
  console.log(' SIGTERM RECEIVED. Shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log(' SIGINT RECEIVED. Shutting down gracefully');
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('UNHANDLED PROMISE REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Start server only after database connection is established
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log(` Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(` API Documentation: http://localhost:${PORT}/api`);
      console.log(` Health Check: http://localhost:${PORT}/api/health`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
      }
    });
    
    // Handle server errors
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(` Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        console.log(' Server error:', err);
        process.exit(1);
      }
    });
    
  } catch (error) {
    console.error(' Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the application
startServer();

module.exports = app;

