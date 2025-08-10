import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting signup process...');
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('MongoDB connected successfully for signup');
    
    const { email, password, name, phone } = await request.json();
    console.log('Received signup data:', { email, name, phone: phone ? 'provided' : 'not provided' });

    // Validate input
    if (!email || !password || !name) {
      console.log('Validation failed:', { email: !!email, password: !!password, name: !!name });
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    console.log('Checking if user exists...');
    const existingUser = await User.findOne({ email });
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
    await user.save();
    console.log('User saved successfully:', user._id);

    // Remove password from response
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      createdAt: user.createdAt,
    };

    console.log('Signup completed successfully');
    return NextResponse.json(
      { message: 'User created successfully', user: userResponse },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Signup error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
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
