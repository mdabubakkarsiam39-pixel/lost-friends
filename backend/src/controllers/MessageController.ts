import { Response, NextFunction } from 'express';
import { MessageService } from '../services/MessageService';
import { AuthRequest } from '../middleware/auth';

export class MessageController {
  static async getMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await MessageService.getMessages(
        req.params.chatId,
        req.userId!,
        page,
        limit
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const message = await MessageService.sendMessage({
        ...req.body,
        senderId: req.userId!,
      });
      res.status(201).json({ message });
    } catch (error) {
      next(error);
    }
  }

  static async deleteMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await MessageService.deleteMessage(
        req.params.id,
        req.userId!
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async markAsDelivered(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const message = await MessageService.markAsDelivered(
        req.params.id,
        req.userId!
      );
      res.json({ message });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const message = await MessageService.markAsRead(
        req.params.id,
        req.userId!
      );
      res.json({ message });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await MessageService.markAllAsRead(req.params.chatId, req.userId!);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  static async searchMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = (req.query.q as string) || '';
      const chatId = req.query.chatId as string | undefined;
      const messages = await MessageService.searchMessages(req.userId!, query, chatId);
      res.json({ messages });
    } catch (error) {
      next(error);
    }
  }

  static async editMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const message = await MessageService.editMessage(
        req.params.id,
        req.userId!,
        req.body.content
      );
      res.json({ message });
    } catch (error) {
      next(error);
    }
  }

  static async addReaction(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const message = await MessageService.addReaction(
        req.params.id,
        req.userId!,
        req.body.emoji
      );
      res.json({ message });
    } catch (error) {
      next(error);
    }
  }

  static async removeReaction(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const message = await MessageService.removeReaction(
        req.params.id,
        req.userId!,
        req.body.emoji
      );
      res.json({ message });
    } catch (error) {
      next(error);
    }
  }

  static async pinMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const message = await MessageService.pinMessage(req.params.id, req.userId!);
      res.json({ message });
    } catch (error) {
      next(error);
    }
  }

  static async unpinMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const message = await MessageService.unpinMessage(req.params.id);
      res.json({ message });
    } catch (error) {
      next(error);
    }
  }

  static async getPinnedMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const messages = await MessageService.getPinnedMessages(req.params.chatId);
      res.json({ messages });
    } catch (error) {
      next(error);
    }
  }

  static async forwardMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const message = await MessageService.forwardMessage(
        req.params.id,
        req.userId!,
        req.body.targetChatId
      );
      res.json({ message });
    } catch (error) {
      next(error);
    }
  }
}