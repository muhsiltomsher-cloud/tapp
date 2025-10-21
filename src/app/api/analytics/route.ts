import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import { requireRole } from '@/lib/auth/middleware';
import { ApiResponse, UserRole, ConversationStatus } from '@/types';

export const GET = requireRole([UserRole.ADMIN, UserRole.MASTER_ADMIN])(
  async (request: NextRequest, user) => {
    try {
      await connectDB();

      const { searchParams } = new URL(request.url);
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      const dateFilter: Record<string, Date> = {};
      if (startDate) {
        dateFilter.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.$lte = new Date(endDate);
      }

      const hasDateFilter = Object.keys(dateFilter).length > 0;

      const totalMessages = await Message.countDocuments(
        hasDateFilter ? { createdAt: dateFilter } : {}
      );

      const totalConversations = await Conversation.countDocuments(
        hasDateFilter ? { createdAt: dateFilter } : {}
      );

      const activeConversations = await Conversation.countDocuments({
        status: { $in: [ConversationStatus.OPEN, ConversationStatus.IN_PROGRESS] },
        ...(hasDateFilter ? { createdAt: dateFilter } : {}),
      });

      const resolvedConversations = await Conversation.countDocuments({
        status: ConversationStatus.RESOLVED,
        ...(hasDateFilter ? { createdAt: dateFilter } : {}),
      });

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const messagesByDay = await Message.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
        {
          $project: {
            _id: 0,
            date: '$_id',
            count: 1,
          },
        },
      ]);

      const conversationsByStatus = await Conversation.aggregate([
        {
          $match: hasDateFilter ? { createdAt: dateFilter } : {},
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            status: '$_id',
            count: 1,
          },
        },
      ]);

      const averageResponseTime = 0;

      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: {
            totalMessages,
            totalConversations,
            activeConversations,
            resolvedConversations,
            averageResponseTime,
            messagesByDay,
            conversationsByStatus,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Get analytics error:', error);
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
