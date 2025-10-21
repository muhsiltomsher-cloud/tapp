import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth/middleware';
import { ApiResponse } from '@/types';

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    await connectDB();

    const userData = await User.findById(user.userId).select('-password');
    if (!userData) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: userData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
});
