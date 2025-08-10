import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, password, name, phone } = await request.json();

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      phone,
    });

    await user.save();

    // Remove password from response
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      createdAt: user.createdAt,
    };

    return NextResponse.json(
      { message: 'User created successfully', user: userResponse },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
