import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    console.log('=== LOGIN PROCESS STARTED ===');
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    console.log('Request method:', request.method);
    console.log('Request URL:', request.url);

    // Check environment variables first
    console.log('Environment check:');
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    console.log('- MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('- JWT_SECRET exists:', !!process.env.JWT_SECRET);

    if (!process.env.MONGODB_URI) {
      console.error('CRITICAL: MONGODB_URI environment variable is missing');
      return NextResponse.json(
        { error: 'Server configuration error: Database connection not configured' },
        { status: 500 }
      );
    }

    if (!process.env.JWT_SECRET) {
      console.error('CRITICAL: JWT_SECRET environment variable is missing');
      return NextResponse.json(
        { error: 'Server configuration error: Authentication not configured' },
        { status: 500 }
      );
    }

    // Connect to MongoDB
    console.log('Attempting MongoDB connection...');
    try {
      await connectDB();
      console.log('MongoDB connected successfully for login');
    } catch (dbError) {
      console.error('MongoDB connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 500 }
      );
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
      console.log('Request body parsed successfully');
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request format. Please check your input.' },
        { status: 400 }
      );
    }

    const { email, password } = requestBody;
    console.log('Extracted data:', { 
      email: email ? `${email.substring(0, 3)}***` : 'missing',
      passwordLength: password ? password.length : 'missing'
    });

    // Validate input
    if (!email || !password) {
      console.log('Validation failed:', { 
        email: !!email, 
        password: !!password 
      });
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    console.log('Looking up user...');
    let user;
    try {
      user = await User.findOne({ email });
      console.log('User lookup completed');
    } catch (lookupError) {
      console.error('User lookup failed:', lookupError);
      return NextResponse.json(
        { error: 'Database query failed. Please try again later.' },
        { status: 500 }
      );
    }

    if (!user) {
      console.log('User not found:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password
    console.log('Verifying password...');
    let isPasswordValid;
    try {
      isPasswordValid = await user.comparePassword(password);
      console.log('Password verification completed');
    } catch (passwordError) {
      console.error('Password verification failed:', passwordError);
      return NextResponse.json(
        { error: 'Authentication service error. Please try again later.' },
        { status: 500 }
      );
    }

    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    console.log('Generating JWT token...');
    let token;
    try {
      token = jwt.sign(
        { userId: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      console.log('JWT token generated successfully');
    } catch (jwtError) {
      console.error('JWT generation failed:', jwtError);
      return NextResponse.json(
        { error: 'Authentication service error. Please try again later.' },
        { status: 500 }
      );
    }

    // Remove password from response
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      createdAt: user.createdAt,
    };

    const response = NextResponse.json(
      { message: 'Login successful', user: userResponse },
      { status: 200 }
    );

    // Set JWT token as HTTP-only cookie
    try {
      const isProduction = process.env.NODE_ENV === 'production';
      const domain = isProduction ? '.freejobai.com' : undefined; // Allow subdomains
      
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: isProduction, // Only use HTTPS in production
        sameSite: isProduction ? 'lax' : 'strict', // More permissive in production
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/', // Ensure cookie is available across all paths
        domain: domain, // Set domain for production
      });
      console.log('JWT cookie set successfully', {
        secure: isProduction,
        sameSite: isProduction ? 'lax' : 'strict',
        domain: domain,
        path: '/'
      });
    } catch (cookieError) {
      console.error('Failed to set JWT cookie:', cookieError);
      return NextResponse.json(
        { error: 'Authentication service error. Please try again later.' },
        { status: 500 }
      );
    }

    console.log('=== LOGIN PROCESS COMPLETED SUCCESSFULLY ===');
    return response;
  } catch (error: unknown) {
    console.error('=== LOGIN PROCESS FAILED ===');
    console.error('Unexpected error:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      if (error.message.includes('MongoDB')) {
        return NextResponse.json(
          { error: 'Database connection failed. Please try again later.' },
          { status: 500 }
        );
      }
      if (error.message.includes('JWT')) {
        return NextResponse.json(
          { error: 'Authentication service error. Please try again later.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
