export enum UserRole {
  MASTER_ADMIN = 'master_admin',
  ADMIN = 'admin',
  CLIENT_USER = 'client_user',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export enum ConversationStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  SENDING = 'sending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phoneNumber?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  messageType: 'text' | 'image' | 'document' | 'template';
  status: MessageStatus;
  whatsappMessageId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversation {
  _id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  assignedTo?: string;
  status: ConversationStatus;
  lastMessageAt: Date;
  tags?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICampaign {
  _id: string;
  name: string;
  description?: string;
  templateId?: string;
  templateContent: string;
  targetAudience: string[];
  scheduledAt?: Date;
  status: CampaignStatus;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl?: string;
  category?: string;
  sku?: string;
  inStock: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAnalytics {
  totalMessages: number;
  totalConversations: number;
  activeConversations: number;
  resolvedConversations: number;
  averageResponseTime: number;
  messagesByDay: Array<{ date: string; count: number }>;
  conversationsByStatus: Array<{ status: string; count: number }>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phoneNumber?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: Omit<IUser, 'password'>;
  message?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
