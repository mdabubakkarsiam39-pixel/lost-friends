import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { generateToken, generateRefreshToken, AuthRequest } from '../middleware/auth';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { User } from '../models/User';

export class AuthController {
  static async syncUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.syncUser(req.body);
      const token = generateToken(user._id.toString(), user.clerkId);
      const refreshToken = generateRefreshToken(user._id.toString(), user.clerkId);

      res.status(200).json({
        user,
        token,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await UserService.getProfile(req.userId!);
      res.json({ user });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token required' });
      }

      try {
        const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as {
          userId: string;
          clerkId: string;
        };

        const user = await User.findById(decoded.userId);
        if (!user) {
          return res.status(401).json({ error: 'User not found' });
        }

        const newToken = generateToken(decoded.userId, decoded.clerkId);
        const newRefreshToken = generateRefreshToken(decoded.userId, decoded.clerkId);

        res.json({
          token: newToken,
          refreshToken: newRefreshToken,
        });
      } catch {
        res.status(401).json({ error: 'Invalid or expired refresh token' });
      }
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { allDevices } = req.body;

      if (allDevices) {
        const userId = req.userId!;
        const { default: mongoose } = await import('mongoose');
        const { Message } = await import('../models/Message');
        const { Chat } = await import('../models/Chat');

        await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
      }

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAccount(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const { Message } = await import('../models/Message');
      const { Chat } = await import('../models/Chat');
      const { Friend } = await import('../models/Friend');
      const { Notification } = await import('../models/Notification');
      const { PushToken } = await import('../models/PushToken');

      await Message.deleteMany({ senderId: userId });
      await Chat.updateMany({ participants: userId }, { $pull: { participants: userId } });
      await Chat.deleteMany({ creatorId: userId, type: 'group' });
      await Friend.deleteMany({ $or: [{ requesterId: userId }, { receiverId: userId }] });
      await Notification.deleteMany({ userId });
      await PushToken.deleteMany({ userId });
      await User.findByIdAndDelete(userId);

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  static async registerPushToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { PushToken } = await import('../models/PushToken');
      const { token, platform } = req.body;
      if (!token || !platform) {
        return res.status(400).json({ error: 'Token and platform required' });
      }

      await PushToken.findOneAndUpdate(
        { token },
        { userId: req.userId!, token, platform },
        { upsert: true, new: true }
      );

      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  static async unregisterPushToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { PushToken } = await import('../models/PushToken');
      await PushToken.deleteOne({ userId: req.userId!, token: req.body.token });
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}