# Lead Management Backend API

A robust Node.js/Express.js REST API for managing leads with MongoDB storage.

## Features

- ✅ **CRUD Operations**: Create, Read, Update, Delete leads
- ✅ **Input Validation**: Server-side validation with express-validator  
- ✅ **Error Handling**: Comprehensive error handling and logging
- ✅ **Security**: Rate limiting, CORS, helmet security headers
- ✅ **Search & Pagination**: Query leads with search and pagination
- ✅ **Statistics**: Lead analytics and reporting
- ✅ **Data Sanitization**: Protection against injection attacks

## Quick Start

### Prerequisites
- Node.js (v14+ recommended)
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `.env` file and update with your values
   - Set your MongoDB connection string
   - Configure CORS for your frontend URL

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **For production:**
   ```bash
   npm start
   ```

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Lead Management
- `POST /api/leads` - Create a new lead
- `GET /api/leads` - Get all leads (with pagination/search)
- `GET /api/leads/:id` - Get lead by ID
- `PATCH /api/leads/:id/status` - Update lead status
- `DELETE /api/leads/:id` - Delete a lead
- `GET /api/leads/stats` - Get lead statistics

### Example API Usage

**Create a Lead:**
```bash
curl -X POST http://localhost:5000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-123-4567"
  }'
```

**Get All Leads:**
```bash
curl "http://localhost:5000/api/leads?page=1&limit=10&status=new"
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | localhost:27017/lead_management |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |
| `NODE_ENV` | Environment mode | development |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   └── leadController.js    # Business logic
├── middleware/
│   ├── validation.js        # Input validation
│   └── errorHandler.js      # Error handling
├── models/
│   └── Lead.js              # Lead data model
├── routes/
│   └── leadRoutes.js        # API routes
├── utils/
│   └── validators.js        # Utility functions
├── .env                     # Environment variables
├── server.js                # Main application
└── package.json             # Dependencies
```

## Development

- **Development mode:** `npm run dev` (uses nodemon for auto-restart)
- **Production mode:** `npm start`
- **Logging:** Console logging enabled in development mode

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for specific frontend origins
- **Helmet**: Security headers for common vulnerabilities
- **Input Sanitization**: XSS and injection protection
- **Validation**: Multi-layer validation (express-validator + Mongoose)

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [/* validation errors if applicable */]
}
```

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `429` - Too Many Requests
- `500` - Internal Server Error