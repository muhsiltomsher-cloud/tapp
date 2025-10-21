import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { RegisterRequest, AuthResponse, UserRole } from '@/types';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body: RegisterRequest = await request.json();
    const { name, email, password, role, phoneNumber } = body;

    if (!name || !email || !password) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: 'Name, email, and password are required',
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: 'Password must be at least 6 characters long',
        },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: 'User already exists with this email',
        },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || UserRole.CLIENT_USER,
      phoneNumber,
    });

    await newUser.save();

    const token = generateToken(newUser);

    const { password: _, ...userWithoutPassword } = newUser.toObject();

    return NextResponse.json<AuthResponse>(
      {
        success: true,
        token,
        user: userWithoutPassword,
        message: 'Registration successful',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
