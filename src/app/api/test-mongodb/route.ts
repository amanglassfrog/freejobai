import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    console.log('Testing MongoDB connection...');
    
    // Test basic connection
    const connection = await connectDB();
    
    // Test if we can perform a simple operation
    const adminDb = connection.connection.db.admin();
    const serverInfo = await adminDb.serverInfo();
    
    console.log('MongoDB connection test successful');
    
    return NextResponse.json({
      success: true,
      connected: true,
      message: 'MongoDB connection successful',
      details: {
        database: connection.connection.db.databaseName,
        host: connection.connection.host,
        port: connection.connection.port,
        readyState: connection.connection.readyState,
        serverVersion: serverInfo.version
      }
    });
  } catch (error: unknown) {
    console.error('MongoDB connection test failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      success: false,
      connected: false,
      message: 'MongoDB connection failed',
      error: errorMessage,
      details: {
        nodeEnv: process.env.NODE_ENV,
        hasMongoUri: !!process.env.MONGODB_URI,
        mongoUriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0
      }
    }, { status: 500 });
  }
}
