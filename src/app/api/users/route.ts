import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { requireRole } from '@/lib/auth/middleware';
import { hashPassword } from '@/lib/auth/password';
import { ApiResponse, UserRole, RegisterRequest } from '@/types';

export const GET = requireRole([UserRole.ADMIN, UserRole.MASTER_ADMIN])(
  async (request: NextRequest) => {
    try {
      await connectDB();

      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const role = searchParams.get('role');
      const search = searchParams.get('search');

      const skip = (page - 1) * limit;

      const query: any = {};
      if (role) {
        query.role = role;
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments(query);

      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: {
            users,
            pagination: {
              page,
              limit,
              total,
              pages: Math.ceil(total / limit),
            },
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Get users error:', error);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Internal server error',
        },
        { status: 500 }
      );
    }
  }
);

export const POST = requireRole([UserRole.MASTER_ADMIN])(
  async (request: NextRequest) => {
    try {
      await connectDB();

      const body: RegisterRequest = await request.json();
      const { name, email, password, role, phoneNumber } = body;

      if (!name || !email || !password) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            message: 'Name, email, and password are required',
          },
          { status: 400 }
        );
      }

      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json<ApiResponse>(
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

      const { password: _, ...userWithoutPassword } = newUser.toObject();

      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: userWithoutPassword,
          message: 'User created successfully',
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Create user error:', error);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Internal server error',
        },
        { status: 500 }
      );
    }
  }
);
