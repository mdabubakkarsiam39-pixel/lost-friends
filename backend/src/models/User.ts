import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types';

export interface IUserDocument extends IUser, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    bio: { type: String, default: '', maxlength: 500 },
    avatar: { type: String, default: '' },
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    settings: {
      readReceipts: { type: Boolean, default: true },
      showOnlineStatus: { type: Boolean, default: true },
      showLastSeen: { type: Boolean, default: true },
      showTypingIndicators: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

UserSchema.index({ username: 'text', fullName: 'text' });

export const User = mongoose.model<IUserDocument>('User', UserSchema);