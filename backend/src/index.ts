import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config from './config/app.config';
import bookingRoutes from './routes/booking.routes';
import analyticsRoutes from './routes/analytics.routes';
import tenantRoutes from './routes/tenant.routes';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors(config.cors));

// Rate limiting
const limiter = rateLimit(config.rateLimit);
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/tenant', tenantRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: config.env === 'development' ? err.message : 'Internal server error' 
  });
});

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Wallsend OT API server running on port ${PORT}`);
  console.log(`   Environment: ${config.env}`);
  console.log(`   Tenant: Wallsend Occupational Therapy`);
});

export default app;
