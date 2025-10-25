import mongoose from 'mongoose';
import { config } from './env';

// ==========================================
// MONGOOSE CONNECTION OPTIONS
// ==========================================

const options: mongoose.ConnectOptions = {
  autoIndex: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

// ==========================================
// CONNECT TO MONGODB
// ==========================================

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongoUri, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err: Error) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed due to app termination');
        process.exit(0);
      } catch (err) {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
      }
    });

  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
};

// ==========================================
// GET CONNECTION STATUS
// ==========================================

export const getConnectionStatus = (): string => {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] || 'unknown';
};