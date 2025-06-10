import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// Mark this route as dynamic to handle POST requests
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    console.log('Starting signup process...');
    await connectDB();
    
    const body = await req.json();
    console.log('Received request body:', { ...body, password: '[REDACTED]' });
    
    const { name, email, password } = body;

    if (!name || !email || !password) {
      console.log('Missing required fields:', { name: !!name, email: !!email, password: !!password });
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists with email:', email);
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with default role as 'client'
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'client'
    });

    await user.save();
    console.log('User created successfully:', { id: user._id, email: user.email });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    return NextResponse.json({ 
      success: true,
      token, 
      user: userResponse 
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}