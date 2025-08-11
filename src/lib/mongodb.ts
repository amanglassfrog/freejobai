import mongoose from 'mongoose';
import { config } from './config';

const MONGODB_URI = config.mongodb.uri;

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: Cached | undefined;
}

const cached: Cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  // Validate required environment variables at runtime
  if (!MONGODB_URI) {
    const errorMessage = `Missing required environment variable: MONGODB_URI. 
    Environment: ${config.isProduction ? 'Production' : 'Development'}
    Please check your production environment configuration.`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  if (cached.conn) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const isProduction = config.isProduction;
    
    // Simplified connection options that work across MongoDB versions
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: isProduction ? 20 : 10,
      serverSelectionTimeoutMS: isProduction ? 10000 : 5000,
      socketTimeoutMS: isProduction ? 60000 : 45000,
      family: 4, // Force IPv4
      
      // Production-specific options (simplified)
      ...(isProduction && {
        retryWrites: true,
        w: 'majority' as const,
        readPreference: 'primary' as const,
        maxIdleTimeMS: 30000,
        minPoolSize: 5,
      }),
    };

    console.log('Connecting to MongoDB...', {
      uri: MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'), // Hide credentials in logs
      nodeEnv: process.env.NODE_ENV,
      isProduction,
      opts: {
        maxPoolSize: opts.maxPoolSize,
        serverSelectionTimeoutMS: opts.serverSelectionTimeoutMS,
        socketTimeoutMS: opts.socketTimeoutMS,
        family: opts.family,
        retryWrites: opts.retryWrites,
        w: opts.w,
        readPreference: opts.readPreference,
        maxIdleTimeMS: opts.maxIdleTimeMS,
        minPoolSize: opts.minPoolSize,
      }
    });

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB connected successfully');
      return mongoose;
    }).catch((error) => {
      console.error('MongoDB connection failed:', error);
      cached.promise = null;
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log('MongoDB connection established');
  } catch (e) {
    console.error('Failed to establish MongoDB connection:', e);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
