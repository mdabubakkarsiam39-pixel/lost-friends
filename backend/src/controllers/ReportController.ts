import { Response, NextFunction } from 'express';
import { ReportService } from '../services/ReportService';
import { AuthRequest } from '../middleware/auth';

export class ReportController {
  static async createReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const report = await ReportService.createReport(
        req.userId!,
        req.body.targetType,
        req.body.targetId,
        req.body.reason,
        req.body.description
      );
      res.status(201).json({ report });
    } catch (error) {
      next(error);
    }
  }

  static async getReports(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const reports = await ReportService.getReports(page);
      res.json({ reports });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const report = await ReportService.updateStatus(
        req.params.id,
        req.body.status
      );
      res.json({ report });
    } catch (error) {
      next(error);
    }
  }
}
