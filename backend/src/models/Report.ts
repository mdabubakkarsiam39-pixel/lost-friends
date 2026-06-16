import mongoose, { Schema, Document } from 'mongoose';

export interface IReport {
  reporterId: mongoose.Types.ObjectId;
  targetType: 'user' | 'message' | 'chat';
  targetId: mongoose.Types.ObjectId;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

export interface IReportDocument extends IReport, Document {}

const ReportSchema = new Schema<IReportDocument>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true } as any,
    targetType: { type: String, enum: ['user', 'message', 'chat'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true, refPath: 'targetType' } as any,
    reason: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
  },
  { timestamps: true }
);

ReportSchema.index({ reporterId: 1 });
ReportSchema.index({ targetType: 1, targetId: 1 });

export const Report = mongoose.model<IReportDocument>('Report', ReportSchema);
