import { Response, NextFunction } from 'express';
import { FriendService } from '../services/FriendService';
import { AuthRequest } from '../middleware/auth';

export class FriendController {
  static async sendRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const friendship = await FriendService.sendRequest(
        req.userId!,
        req.body.receiverId
      );
      res.status(201).json({ friendship });
    } catch (error) {
      next(error);
    }
  }

  static async acceptRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const friendship = await FriendService.acceptRequest(
        req.userId!,
        req.body.friendId
      );
      res.json({ friendship });
    } catch (error) {
      next(error);
    }
  }

  static async rejectRequest(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await FriendService.rejectRequest(
        req.userId!,
        req.body.friendId
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async removeFriend(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await FriendService.removeFriend(
        req.userId!,
        req.params.id
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async blockUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await FriendService.blockUser(
        req.userId!,
        req.body.receiverId
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async unblockUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await FriendService.unblockUser(
        req.userId!,
        req.body.receiverId
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}