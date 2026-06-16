import { Response, NextFunction } from 'express';
import { NotificationService } from '../services/NotificationService';
import { AuthRequest } from '../middleware/auth';

export class NotificationController {
  static async getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const result = await NotificationService.getNotifications(req.userId!, page);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const notification = await NotificationService.markAsRead(
        req.params.id,
        req.userId!
      );
      res.json({ notification });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await NotificationService.markAllAsRead(req.userId!);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  static async getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const count = await NotificationService.getUnreadCount(req.userId!);
      res.json({ count });
    } catch (error) {
      next(error);
    }
  }
}