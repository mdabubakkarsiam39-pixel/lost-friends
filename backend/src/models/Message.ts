import mongoose, { Schema, Document } from 'mongoose';
import { IMessage } from '../types';

export interface IMessageDocument extends IMessage, Document {}

const MessageSchema = new Schema<IMessageDocument>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true, index: true } as any,
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true } as any,
    type: { type: String, enum: ['text', 'image', 'video', 'file', 'voice'], default: 'text' },
    content: { type: String, required: true },
    mediaUrl: { type: String, default: '' },
    mediaThumbnail: { type: String, default: '' },
    fileName: { type: String, default: '' },
    fileSize: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    status: { type: String, enum: ['sending', 'sent', 'delivered', 'read'], default: 'sent' },
    edited: { type: Boolean, default: false },
    editedAt: { type: Date },
    reactions: { type: Map, of: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: new Map() } as any,
    isPinned: { type: Boolean, default: false },
    pinnedBy: { type: Schema.Types.ObjectId, ref: 'User' } as any,
    pinnedAt: { type: Date },
    forwardedFrom: { type: Schema.Types.ObjectId, ref: 'User' } as any,
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }] as any,
    deliveredTo: [{ type: Schema.Types.ObjectId, ref: 'User' }] as any,
    replyTo: { type: Schema.Types.ObjectId, ref: 'Message' } as any,
  },
  { timestamps: true }
);

MessageSchema.index({ chatId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1, createdAt: -1 });

export const Message = mongoose.model<IMessageDocument>('Message', MessageSchema);