import mongoose from 'mongoose';

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  const errorMessage = `Missing required environment variables: ${missingEnvVars.join(', ')}. Please check your production environment configuration.`;
  console.error(errorMessage);
  throw new Error(errorMessage);
}

const MONGODB_URI = process.env.MONGODB_URI!;

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
  if (cached.conn) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const isProduction = process.env.NODE_ENV === 'production';
    
    const opts = {
      bufferCommands: false,
      maxPoolSize: isProduction ? 20 : 10,
      serverSelectionTimeoutMS: isProduction ? 10000 : 5000,
      socketTimeoutMS: isProduction ? 60000 : 45000,
      family: 4, // Force IPv4
      // Production-specific options
      ...(isProduction && {
        ssl: true,
        sslValidate: true,
        retryWrites: true,
        w: 'majority',
        readPreference: 'primary',
        maxIdleTimeMS: 30000,
        minPoolSize: 5,
      }),
    };

    console.log('Connecting to MongoDB...', {
      uri: MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'), // Hide credentials in logs
      nodeEnv: process.env.NODE_ENV,
      isProduction,
      opts: {
        ...opts,
        // Don't log sensitive production options
        ...(isProduction && { ssl: '***', sslValidate: '***' })
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
