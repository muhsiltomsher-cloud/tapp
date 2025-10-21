import mongoose, { Schema, Model } from 'mongoose';
import { IConversation, ConversationStatus } from '@/types';

const ConversationSchema = new Schema<IConversation>(
  {
    customerId: {
      type: String,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
      index: true,
    },
    assignedTo: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(ConversationStatus),
      default: ConversationStatus.OPEN,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    tags: [{
      type: String,
    }],
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

ConversationSchema.index({ customerPhone: 1 });
ConversationSchema.index({ assignedTo: 1 });
ConversationSchema.index({ status: 1 });
ConversationSchema.index({ lastMessageAt: -1 });

const Conversation: Model<IConversation> = mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation;
