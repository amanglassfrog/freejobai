import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('Debug endpoint called - checking system status...');
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      environment: {
        hasMongoUri: !!process.env.MONGODB_URI,
        mongoUriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
        hasJwtSecret: !!process.env.JWT_SECRET,
        jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime(),
      },
      headers: {
        userAgent: 'N/A', // Will be set from request
        host: 'N/A', // Will be set from request
      }
    };

    console.log('Debug info collected:', debugInfo);
    
    return NextResponse.json({
      success: true,
      message: 'Debug information collected successfully',
      data: debugInfo
    });
    
  } catch (error: unknown) {
    console.error('Debug endpoint error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Debug endpoint failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Debug POST request received:', body);
    
    // Test MongoDB connection if requested
    if (body.testMongo) {
      try {
        const connectDB = await import('@/lib/mongodb');
        await connectDB.default();
        
        return NextResponse.json({
          success: true,
          message: 'MongoDB connection test successful',
          mongoTest: 'PASSED'
        });
      } catch (mongoError) {
        console.error('MongoDB test failed:', mongoError);
        return NextResponse.json({
          success: false,
          message: 'MongoDB connection test failed',
          mongoTest: 'FAILED',
          error: mongoError instanceof Error ? mongoError.message : 'Unknown MongoDB error'
        }, { status: 500 });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Debug POST request processed',
      receivedData: body
    });
    
  } catch (error: unknown) {
    console.error('Debug POST error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Debug POST request failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
