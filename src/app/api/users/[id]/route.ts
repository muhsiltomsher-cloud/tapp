import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/auth/middleware';
import { hashPassword } from '@/lib/auth/password';
import { ApiResponse, UserRole } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = authenticateRequest(request);
  if (!user || ![UserRole.ADMIN, UserRole.MASTER_ADMIN].includes(user.role as UserRole)) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    await connectDB();
    const { id } = await params;

    const userData = await User.findById(id).select('-password');
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
    console.error('Get user error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = authenticateRequest(request);
  if (!user || ![UserRole.ADMIN, UserRole.MASTER_ADMIN].includes(user.role as UserRole)) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const { name, email, role, phoneNumber, isActive, password } = body;

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (role) updateData.role = role;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (password) {
      updateData.password = await hashPassword(password);
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
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
        data: updatedUser,
        message: 'User updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = authenticateRequest(request);
  if (!user || user.role !== UserRole.MASTER_ADMIN) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    await connectDB();
    const { id } = await params;

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
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
        message: 'User deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
