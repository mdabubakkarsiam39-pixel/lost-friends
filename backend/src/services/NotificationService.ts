import { Notification } from '../models/Notification';
import { NotificationType } from '../types';

export class NotificationService {
  static async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }) {
    return Notification.create(data);
  }

  static async getNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ userId }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async markAsRead(notificationId: string, userId: string) {
    return Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true },
      { new: true }
    );
  }

  static async markAllAsRead(userId: string) {
    return Notification.updateMany({ userId, read: false }, { read: true });
  }

  static async getUnreadCount(userId: string) {
    return Notification.countDocuments({ userId, read: false });
  }
}