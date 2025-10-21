import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Campaign from '@/models/Campaign';
import Message from '@/models/Message';
import { authenticateRequest } from '@/lib/auth/middleware';
import whatsAppClient from '@/lib/whatsapp/client';
import { ApiResponse, UserRole, CampaignStatus, MessageStatus } from '@/types';

export async function POST(
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

    if (campaign.status === CampaignStatus.SENDING || campaign.status === CampaignStatus.COMPLETED) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Campaign is already being sent or has been completed',
        },
        { status: 400 }
      );
    }

    campaign.status = CampaignStatus.SENDING;
    await campaign.save();

    let sentCount = 0;
    let deliveredCount = 0;
    let failedCount = 0;

    for (const recipientPhone of campaign.targetAudience) {
      try {
        const whatsappResponse = await whatsAppClient.sendTextMessage(
          recipientPhone,
          campaign.templateContent
        );

        const message = new Message({
          conversationId: `campaign-${campaign._id}`,
          senderId: user.userId,
          recipientId: recipientPhone,
          content: campaign.templateContent,
          messageType: 'template',
          status: whatsappResponse ? MessageStatus.SENT : MessageStatus.FAILED,
          whatsappMessageId: whatsappResponse?.messages[0]?.id,
          metadata: {
            campaignId: campaign._id,
            campaignName: campaign.name,
          },
        });

        await message.save();

        if (whatsappResponse) {
          sentCount++;
          deliveredCount++;
        } else {
          failedCount++;
        }
      } catch (error) {
        console.error(`Failed to send message to ${recipientPhone}:`, error);
        failedCount++;
      }
    }

    campaign.sentCount = sentCount;
    campaign.deliveredCount = deliveredCount;
    campaign.failedCount = failedCount;
    campaign.status = CampaignStatus.COMPLETED;
    await campaign.save();

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          campaign,
          stats: {
            sentCount,
            deliveredCount,
            failedCount,
          },
        },
        message: 'Campaign sent successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send campaign error:', error);
    
    try {
      const { id } = await params;
      await Campaign.findByIdAndUpdate(id, { status: CampaignStatus.FAILED });
    } catch (updateError) {
      console.error('Failed to update campaign status:', updateError);
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
