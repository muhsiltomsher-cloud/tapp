import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Conversation from '@/models/Conversation';
import { requireAuth } from '@/lib/auth/middleware';
import { ApiResponse, UserRole } from '@/types';

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const assignedTo = searchParams.get('assignedTo');

    const skip = (page - 1) * limit;

    const query: any = {};
    
    if (user.role === UserRole.CLIENT_USER) {
      query.assignedTo = user.userId;
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (status) {
      query.status = status;
    }

    const conversations = await Conversation.find(query)
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Conversation.countDocuments(query);

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          conversations,
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
    console.error('Get conversations error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
});
