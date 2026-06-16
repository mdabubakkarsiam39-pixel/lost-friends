import { Report } from '../models/Report';
import { AppError } from '../middleware/errorHandler';

export class ReportService {
  static async createReport(
    reporterId: string,
    targetType: 'user' | 'message' | 'chat',
    targetId: string,
    reason: string,
    description?: string
  ) {
    const existing = await Report.findOne({
      reporterId,
      targetType,
      targetId,
      status: 'pending',
    });
    if (existing) throw new AppError('Report already pending', 409);

    return Report.create({
      reporterId,
      targetType,
      targetId,
      reason,
      description,
    });
  }

  static async getReports(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    return Report.find()
      .populate('reporterId', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  static async updateStatus(reportId: string, status: 'reviewed' | 'resolved') {
    const report = await Report.findByIdAndUpdate(
      reportId,
      { status },
      { new: true }
    );
    if (!report) throw new AppError('Report not found', 404);
    return report;
  }
}
