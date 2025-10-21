import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { comparePassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { LoginRequest, AuthResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body: LoginRequest = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: 'Email and password are required',
        },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: 'Invalid credentials',
        },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: 'Account is deactivated',
        },
        { status: 401 }
      );
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: 'Invalid credentials',
        },
        { status: 401 }
      );
    }

    const token = generateToken(user);

    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json<AuthResponse>(
      {
        success: true,
        token,
        user: userWithoutPassword,
        message: 'Login successful',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
