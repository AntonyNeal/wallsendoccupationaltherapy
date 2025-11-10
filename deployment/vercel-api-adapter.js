/**
 * ============================================================================
 * VERCEL SERVERLESS FUNCTION ADAPTER - REUSABLE TEMPLATE
 * ============================================================================
 *
 * This file adapts an Express.js API for Vercel's serverless platform.
 *
 * USAGE IN NEW PROJECTS:
 * 1. Copy this file to your project's api/ folder as index.js
 * 2. Update the CORS allowed patterns with your domain
 * 3. Update route imports to match your API structure
 * 4. Deploy to Vercel
 *
 * CUSTOMIZATION POINTS:
 * - Line ~30: CORS allowedPatterns - Add your domains
 * - Line ~55: Route imports - Match your API structure
 * - Line ~60: Route mounting - Match your endpoints
 *
 * ============================================================================
 */

// Vercel Serverless Function Handler for Express API
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Define allowed patterns for your domains
      const allowedPatterns = [
        /^https?:\/\/([a-z0-9-]+\.)?vercel\.app$/, // Vercel deployments
        /^https?:\/\/([a-z0-9-]+\.)?osullivanfarms\.tech$/, // Your custom domain
        /^http:\/\/localhost(:\d+)?$/, // localhost:*
        /^http:\/\/127\.0\.0\.1(:\d+)?$/, // 127.0.0.1:*
      ];

      // Check if origin matches any allowed pattern
      const isAllowed = allowedPatterns.some((pattern) => pattern.test(origin));

      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`CORS: Blocked origin ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} ${req.method} ${req.path}`);
  next();
});

// Import routes
try {
  const bookingRoutes = require('./routes/bookings');
  const statusRoutes = require('./routes/status');
  const paymentRoutes = require('./routes/payments');

  // Routes
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/status', statusRoutes);
  app.use('/api/payments', paymentRoutes);
} catch (error) {
  console.error('Error loading routes:', error);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
  });
});

// Export the Express app as a Vercel serverless function
module.exports = app;
