import mongoose, { Schema, Document } from 'mongoose';
import { IPushToken } from '../types';

export interface IPushTokenDocument extends IPushToken, Document {}

const PushTokenSchema = new Schema<IPushTokenDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true } as any,
    token: { type: String, required: true, unique: true },
    platform: { type: String, enum: ['ios', 'android', 'web'], required: true },
  },
  { timestamps: true }
);

PushTokenSchema.index({ userId: 1 });

export const PushToken = mongoose.model<IPushTokenDocument>('PushToken', PushTokenSchema);