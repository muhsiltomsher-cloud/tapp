import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Campaign from '@/models/Campaign';
import { authenticateRequest } from '@/lib/auth/middleware';
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

    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Campaign not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: campaign,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get campaign error:', error);
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
    const { name, description, templateContent, targetAudience, scheduledAt, status } = body;

    const updateData: Record<string, unknown> = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (templateContent) updateData.templateContent = templateContent;
    if (targetAudience) updateData.targetAudience = targetAudience;
    if (scheduledAt) updateData.scheduledAt = new Date(scheduledAt);
    if (status) updateData.status = status;

    const campaign = await Campaign.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!campaign) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Campaign not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: campaign,
        message: 'Campaign updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update campaign error:', error);
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
  if (!user || ![UserRole.ADMIN, UserRole.MASTER_ADMIN].includes(user.role as UserRole)) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    await connectDB();
    const { id } = await params;

    const campaign = await Campaign.findByIdAndDelete(id);
    if (!campaign) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Campaign not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Campaign deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete campaign error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
