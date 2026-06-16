import mongoose, { Schema, Document } from 'mongoose';
import { IChat } from '../types';

export interface IChatDocument extends IChat, Document {}

const ChatSchema = new Schema<IChatDocument>(
  {
    type: { type: String, enum: ['private', 'group'], required: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }] as any,
    name: { type: String, trim: true, maxlength: 100 },
    avatar: { type: String, default: '' },
    lastMessage: { type: String, default: '' },
    lastMessageAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true } as any,
    admins: [{ type: Schema.Types.ObjectId, ref: 'User' }] as any,
    isArchived: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    mutedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }] as any,
    inviteToken: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

ChatSchema.index({ participants: 1 });
ChatSchema.index({ lastMessageAt: -1 });
ChatSchema.index({ type: 1 });

export const Chat = mongoose.model<IChatDocument>('Chat', ChatSchema);