import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    console.log('=== SIGNUP PROCESS STARTED ===');
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
      console.log('MongoDB connected successfully for signup');
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

    const { email, password, name, phone } = requestBody;
    console.log('Extracted data:', { 
      email: email ? `${email.substring(0, 3)}***` : 'missing',
      name: name ? 'provided' : 'missing',
      phone: phone ? 'provided' : 'not provided',
      passwordLength: password ? password.length : 'missing'
    });

    // Validate input
    if (!email || !password || !name) {
      console.log('Validation failed:', { 
        email: !!email, 
        password: !!password, 
        name: !!name 
      });
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    console.log('Checking if user exists...');
    let existingUser;
    try {
      existingUser = await User.findOne({ email });
      console.log('User lookup completed');
    } catch (lookupError) {
      console.error('User lookup failed:', lookupError);
      return NextResponse.json(
        { error: 'Database query failed. Please try again later.' },
        { status: 500 }
      );
    }

    if (existingUser) {
      console.log('User already exists:', email);
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create new user
    console.log('Creating new user...');
    const user = new User({
      email,
      password,
      name,
      phone,
    });

    console.log('Saving user to database...');
    let savedUser;
    try {
      savedUser = await user.save();
      console.log('User saved successfully:', savedUser._id);
    } catch (saveError) {
      console.error('User save failed:', saveError);
      if (saveError instanceof Error && saveError.message.includes('validation failed')) {
        return NextResponse.json(
          { error: 'Invalid data provided. Please check your input.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to create user. Please try again later.' },
        { status: 500 }
      );
    }

    // Remove password from response
    const userResponse = {
      id: savedUser._id,
      email: savedUser.email,
      name: savedUser.name,
      phone: savedUser.phone,
      createdAt: savedUser.createdAt,
    };

    console.log('=== SIGNUP PROCESS COMPLETED SUCCESSFULLY ===');
    return NextResponse.json(
      { message: 'User created successfully', user: userResponse },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('=== SIGNUP PROCESS FAILED ===');
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
      if (error.message.includes('validation failed')) {
        return NextResponse.json(
          { error: 'Invalid data provided. Please check your input.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
