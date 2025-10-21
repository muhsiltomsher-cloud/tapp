import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Message from '@/models/Message';
import Conversation from '@/models/Conversation';
import { MessageStatus, ConversationStatus } from '@/types';
import { emitNewMessage } from '@/lib/socket/server';

const WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'your-webhook-verify-token';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
    console.log('Webhook verified');
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json(
    { error: 'Verification failed' },
    { status: 403 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === 'messages') {
            const value = change.value;

            if (value.messages) {
              for (const message of value.messages) {
                await handleIncomingMessage(message, value);
              }
            }

            if (value.statuses) {
              for (const status of value.statuses) {
                await handleMessageStatus(status);
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleIncomingMessage(message: any, value: any) {
  try {
    await connectDB();

    const customerPhone = message.from;
    const messageText = message.text?.body || '';
    const messageType = message.type || 'text';
    const whatsappMessageId = message.id;

    let conversation = await Conversation.findOne({ customerPhone });

    if (!conversation) {
      const contact = value.contacts?.[0];
      const customerName = contact?.profile?.name || customerPhone;

      conversation = new Conversation({
        customerId: customerPhone,
        customerName,
        customerPhone,
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

    const newMessage = new Message({
      conversationId: conversation._id.toString(),
      senderId: customerPhone,
      recipientId: 'system',
      content: messageText,
      messageType,
      status: MessageStatus.DELIVERED,
      whatsappMessageId,
    });

    await newMessage.save();

    emitNewMessage(conversation._id.toString(), newMessage);

    console.log(`Incoming message from ${customerPhone}: ${messageText}`);
  } catch (error) {
    console.error('Handle incoming message error:', error);
  }
}

async function handleMessageStatus(status: any) {
  try {
    await connectDB();

    const whatsappMessageId = status.id;
    const newStatus = status.status;

    let messageStatus: MessageStatus;
    switch (newStatus) {
      case 'sent':
        messageStatus = MessageStatus.SENT;
        break;
      case 'delivered':
        messageStatus = MessageStatus.DELIVERED;
        break;
      case 'read':
        messageStatus = MessageStatus.READ;
        break;
      case 'failed':
        messageStatus = MessageStatus.FAILED;
        break;
      default:
        return;
    }

    await Message.findOneAndUpdate(
      { whatsappMessageId },
      { status: messageStatus }
    );

    console.log(`Message ${whatsappMessageId} status updated to ${messageStatus}`);
  } catch (error) {
    console.error('Handle message status error:', error);
  }
}
