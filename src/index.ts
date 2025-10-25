import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config/env';
import { connectDB, getConnectionStatus } from './config/database';
import { testAWSConnection } from './config/aws';
import { AppError } from './utils/errors';
import { ResponseHandler } from './utils/response';

// ==========================================
// INITIALIZE EXPRESS APP
// ==========================================

const app: Application = express();

// ==========================================
// MIDDLEWARE
// ==========================================

// Trust proxy (required for Render)
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Request timestamp
app.use((req: Request, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ==========================================
// HEALTH CHECK
// ==========================================

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    environment: config.env,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    mongodb: getConnectionStatus(),
  });
});

app.get('/', (req: Request, res: Response) => {
  ResponseHandler.success(res, {
    message: 'Family Budget SaaS API',
    version: config.apiVersion,
    documentation: `/api/${config.apiVersion}/docs`,
    endpoints: {
      health: '/health',
      auth: `/api/${config.apiVersion}/auth`,
      budgets: `/api/${config.apiVersion}/budgets`,
      expenses: `/api/${config.apiVersion}/expenses`,
    }
  });
});

// ==========================================
// API ROUTES (Coming in Day 3)
// ==========================================

// app.use(`/api/${config.apiVersion}/auth`, authRoutes);
// app.use(`/api/${config.apiVersion}/families`, familyRoutes);
// app.use(`/api/${config.apiVersion}/budgets`, budgetRoutes);
// app.use(`/api/${config.apiVersion}/expenses`, expenseRoutes);
// app.use(`/api/${config.apiVersion}/reports`, reportRoutes);

// ==========================================
// ERROR HANDLING
// ==========================================

// 404 handler
app.use((req: Request, res: Response) => {
  ResponseHandler.error(res, 'Route not found', 404);
});

// Global error handler
app.use((err: Error | AppError, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error:', err);

  if (err instanceof AppError) {
    return ResponseHandler.error(res, err.message, err.statusCode, 
      config.env === 'development' ? err : undefined
    );
  }

  return ResponseHandler.error(res, 'Internal Server Error', 500, 
    config.env === 'development' ? err : undefined
  );
});

// ==========================================
// START SERVER
// ==========================================

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Test AWS connections (optional in production)
    if (config.env === 'development') {
      await testAWSConnection();
    }

    // Get port from environment (Render uses PORT env var)
    const PORT = process.env.PORT || config.port;

    // Start Express server
    app.listen(PORT, () => {
      console.log('🚀 ========================================');
      console.log(`🚀 Server running in ${config.env} mode`);
      console.log(`🚀 Port: ${PORT}`);
      console.log(`🚀 Health: /health`);
      console.log('🚀 ========================================');
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

// ==========================================
// ERROR HANDLERS
// ==========================================

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

// START THE SERVER
startServer();

export default app;