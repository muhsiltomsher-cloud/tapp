import mongoose, { Schema, Model } from 'mongoose';
import { ICampaign, CampaignStatus } from '@/types';

const CampaignSchema = new Schema<ICampaign>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    templateId: {
      type: String,
    },
    templateContent: {
      type: String,
      required: true,
    },
    targetAudience: [{
      type: String,
    }],
    scheduledAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(CampaignStatus),
      default: CampaignStatus.DRAFT,
    },
    sentCount: {
      type: Number,
      default: 0,
    },
    deliveredCount: {
      type: Number,
      default: 0,
    },
    readCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

CampaignSchema.index({ createdBy: 1 });
CampaignSchema.index({ status: 1 });
CampaignSchema.index({ scheduledAt: 1 });

const Campaign: Model<ICampaign> = mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', CampaignSchema);

export default Campaign;
