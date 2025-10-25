import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// ==========================================
// ENVIRONMENT VALIDATION SCHEMA
// ==========================================

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default(3000),
  API_VERSION: z.string().default('v1'),

  // Database
  MONGODB_URI: z.string().url(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRE: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRE: z.string().default('30d'),

  // AWS
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  S3_BUCKET_NAME: z.string().optional(),
  SQS_QUEUE_URL: z.string().url().optional(),
  SES_FROM_EMAIL: z.string().email().optional(),
  SES_REGION: z.string().default('us-east-1'),

  // Frontend
  FRONTEND_URL: z.string().url().default('http://localhost:3001'),
  CORS_ORIGIN: z.string().default('http://localhost:3001'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default(100),

  // File Upload
  MAX_FILE_SIZE: z.string().transform(Number).default(5242880),
  ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,image/jpg,application/pdf'),

  // AI
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4'),

  // Payment
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Monitoring
  SENTRY_DSN: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

// ==========================================
// VALIDATE AND EXPORT CONFIG
// ==========================================

const parseEnv = () => {
  try {
    const parsed = envSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.issues.forEach((err) => {
        console.error(`   - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
};

const env = parseEnv();

// ==========================================
// TYPED CONFIG OBJECT
// ==========================================

export const config = {
  // Server
  env: env.NODE_ENV,
  port: env.PORT,
  apiVersion: env.API_VERSION,

  // Database
  mongoUri: env.MONGODB_URI,

  // JWT
  jwt: {
    secret: env.JWT_SECRET,
    expire: env.JWT_EXPIRE,
    refreshSecret: env.JWT_REFRESH_SECRET,
    refreshExpire: env.JWT_REFRESH_EXPIRE,
  },

  // AWS
  aws: {
    region: env.AWS_REGION,
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    s3BucketName: env.S3_BUCKET_NAME,
    sqsQueueUrl: env.SQS_QUEUE_URL,
    sesFromEmail: env.SES_FROM_EMAIL,
    sesRegion: env.SES_REGION,
  },

  // Frontend
  frontendUrl: env.FRONTEND_URL,
  corsOrigin: env.CORS_ORIGIN.split(','),

  // Rate Limiting
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },

  // File Upload
  upload: {
    maxFileSize: env.MAX_FILE_SIZE,
    allowedTypes: env.ALLOWED_FILE_TYPES.split(','),
  },

  // AI
  openai: {
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL,
  },

  // Payment
  stripe: {
    secretKey: env.STRIPE_SECRET_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
  },

  // Monitoring
  sentry: {
    dsn: env.SENTRY_DSN,
  },
  logLevel: env.LOG_LEVEL,
} as const;

export type Config = typeof config;