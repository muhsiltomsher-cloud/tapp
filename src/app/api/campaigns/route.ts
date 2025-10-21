import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Campaign from '@/models/Campaign';
import { requireRole } from '@/lib/auth/middleware';
import { ApiResponse, UserRole, CampaignStatus } from '@/types';

export const GET = requireRole([UserRole.ADMIN, UserRole.MASTER_ADMIN])(
  async (request: NextRequest, user) => {
    try {
      await connectDB();

      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '10');
      const status = searchParams.get('status');

      const skip = (page - 1) * limit;

      const query: any = {};
      if (status) {
        query.status = status;
      }

      const campaigns = await Campaign.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Campaign.countDocuments(query);

      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: {
            campaigns,
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
      console.error('Get campaigns error:', error);
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

export const POST = requireRole([UserRole.ADMIN, UserRole.MASTER_ADMIN])(
  async (request: NextRequest, user) => {
    try {
      await connectDB();

      const body = await request.json();
      const { name, description, templateContent, targetAudience, scheduledAt } = body;

      if (!name || !templateContent || !targetAudience || targetAudience.length === 0) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            message: 'Name, template content, and target audience are required',
          },
          { status: 400 }
        );
      }

      const campaign = new Campaign({
        name,
        description,
        templateContent,
        targetAudience,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        status: CampaignStatus.DRAFT,
        createdBy: user.userId,
      });

      await campaign.save();

      return NextResponse.json<ApiResponse>(
        {
          success: true,
          data: campaign,
          message: 'Campaign created successfully',
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Create campaign error:', error);
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
