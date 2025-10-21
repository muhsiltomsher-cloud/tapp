import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import { authenticateRequest } from '@/lib/auth/middleware';
import { ApiResponse, UserRole, ConversationStatus } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = authenticateRequest(request);
  if (!user) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    await connectDB();
    const { id } = await params;

    const conversation = await Conversation.findById(id)
      .populate('assignedTo', 'name email')
      .populate('lastMessage');

    if (!conversation) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Conversation not found',
        },
        { status: 404 }
      );
    }

    const messages = await Message.find({ conversationId: id })
      .sort({ createdAt: 1 })
      .limit(100);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          conversation,
          messages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get conversation error:', error);
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
  if (!user || ![UserRole.ADMIN, UserRole.MASTER_ADMIN, UserRole.CLIENT_USER].includes(user.role as UserRole)) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    await connectDB();
    const { id } = await params;

    const body = await request.json();
    const { status, assignedTo, tags } = body;

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (tags) updateData.tags = tags;

    const conversation = await Conversation.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'name email')
      .populate('lastMessage');

    if (!conversation) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Conversation not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: conversation,
        message: 'Conversation updated successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update conversation error:', error);
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

    const conversation = await Conversation.findByIdAndUpdate(
      id,
      { status: ConversationStatus.CLOSED },
      { new: true }
    );

    if (!conversation) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Conversation not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        message: 'Conversation closed successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Close conversation error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
