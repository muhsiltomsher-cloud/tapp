import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import { requireAuth } from '@/lib/auth/middleware';
import whatsAppClient from '@/lib/whatsapp/client';
import { ApiResponse, MessageStatus, ConversationStatus } from '@/types';

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    await connectDB();

    const body = await request.json();
    const { conversationId, recipientPhone, content, messageType = 'text' } = body;

    if (!recipientPhone || !content) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: 'Recipient phone and content are required',
        },
        { status: 400 }
      );
    }

    let conversation = await Conversation.findOne({ customerPhone: recipientPhone });
    
    if (!conversation) {
      conversation = new Conversation({
        customerId: recipientPhone,
        customerName: recipientPhone,
        customerPhone: recipientPhone,
        assignedTo: user.userId,
        status: ConversationStatus.OPEN,
        lastMessageAt: new Date(),
      });
      await conversation.save();
    } else {
      conversation.lastMessageAt = new Date();
      if (conversation.status === ConversationStatus.CLOSED) {
        conversation.status = ConversationStatus.OPEN;
      }
      await conversation.save();
    }

    const whatsappResponse = await whatsAppClient.sendTextMessage(recipientPhone, content);
    
    const message = new Message({
      conversationId: conversation._id.toString(),
      senderId: user.userId,
      recipientId: recipientPhone,
      content,
      messageType,
      status: whatsappResponse ? MessageStatus.SENT : MessageStatus.FAILED,
      whatsappMessageId: whatsappResponse?.messages[0]?.id,
    });

    await message.save();

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          message,
          conversation,
        },
        message: 'Message sent successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
});
