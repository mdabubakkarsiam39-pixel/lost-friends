import mongoose, { Schema, Document } from 'mongoose';
import { IFriend } from '../types';

export interface IFriendDocument extends IFriend, Document {}

const FriendSchema = new Schema<IFriendDocument>(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true } as any,
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true } as any,
    status: { type: String, enum: ['pending', 'accepted', 'blocked', 'rejected'], default: 'pending', index: true },
  },
  { timestamps: true }
);

FriendSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });
FriendSchema.index({ receiverId: 1, status: 1 });
FriendSchema.index({ senderId: 1, status: 1 });

export const Friend = mongoose.model<IFriendDocument>('Friend', FriendSchema);