import { Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { FriendService } from '../services/FriendService';
import { AuthRequest } from '../middleware/auth';

export class UserController {
  static async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getProfile(req.params.id);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

  static async getOwnProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getProfile(req.userId!);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await UserService.updateProfile(req.userId!, req.body);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

  static async searchUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = (req.query.q as string) || '';
      const users = await UserService.searchUsers(query, req.userId);
      res.json({ users });
    } catch (error) {
      next(error);
    }
  }

  static async getUserFriends(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const friends = await FriendService.getFriends(req.userId!);
      res.json({ friends });
    } catch (error) {
      next(error);
    }
  }

  static async getPendingRequests(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const requests = await FriendService.getPendingRequests(req.userId!);
      res.json({ requests });
    } catch (error) {
      next(error);
    }
  }

  static async getFriendshipStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const status = await FriendService.getFriendshipStatus(
        req.userId!,
        req.params.targetId
      );
      res.json({ status });
    } catch (error) {
      next(error);
    }
  }

  static async updateSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await UserService.updateSettings(req.userId!, req.body);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

  static async getPrivacySettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const settings = await UserService.getPrivacySettings(req.userId!);
      res.json({ settings });
    } catch (error) {
      next(error);
    }
  }

  static async globalSearch(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = (req.query.q as string) || '';
      const [users, messages, chats] = await Promise.all([
        UserService.searchUsers(query, req.userId),
        import('../services/MessageService').then((m) => m.MessageService.searchMessages(req.userId!, query)),
        import('../services/ChatService').then((m) => m.ChatService.searchChats(req.userId!, query)),
      ]);
      res.json({ users, messages, chats });
    } catch (error) {
      next(error);
    }
  }
}