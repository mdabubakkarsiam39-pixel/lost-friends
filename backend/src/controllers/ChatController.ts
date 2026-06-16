import { Response, NextFunction } from 'express';
import { ChatService } from '../services/ChatService';
import { PushNotificationService } from '../services/PushNotificationService';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';

export class ChatController {
  static async getChats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const chats = await ChatService.getUserChats(req.userId!);
      res.json({ chats });
    } catch (error) {
      next(error);
    }
  }

  static async createPrivateChat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const chat = await ChatService.createPrivateChat(
        req.userId!,
        req.body.participantId
      );
      res.status(201).json({ chat });
    } catch (error) {
      next(error);
    }
  }

  static async createGroupChat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const chat = await ChatService.createGroupChat(req.userId!, req.body);
      res.status(201).json({ chat });
    } catch (error) {
      next(error);
    }
  }

  static async getChatById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const chat = await ChatService.getChatById(req.params.id, req.userId!);
      res.json({ chat });
    } catch (error) {
      next(error);
    }
  }

  static async deleteChat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ChatService.deleteChat(req.params.id, req.userId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async addMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const chat = await ChatService.addMember(
        req.params.id,
        req.userId!,
        req.body.memberId
      );
      const inviter = await User.findById(req.userId).select('username');
      if (inviter) {
        await PushNotificationService.notifyGroupInvite(
          req.body.memberId,
          inviter.username,
          chat.name || 'Group',
          req.params.id
        );
      }
      res.json({ chat });
    } catch (error) {
      next(error);
    }
  }

  static async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const chat = await ChatService.removeMember(
        req.params.id,
        req.userId!,
        req.params.memberId
      );
      res.json({ chat });
    } catch (error) {
      next(error);
    }
  }

  static async archiveChat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const chat = await ChatService.archiveChat(req.params.id, req.userId!);
      res.json({ chat });
    } catch (error) {
      next(error);
    }
  }

  static async unarchiveChat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const chat = await ChatService.unarchiveChat(req.params.id, req.userId!);
      res.json({ chat });
    } catch (error) {
      next(error);
    }
  }

  static async muteChat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const chat = await ChatService.muteChat(req.params.id, req.userId!);
      res.json({ chat });
    } catch (error) {
      next(error);
    }
  }

  static async unmuteChat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const chat = await ChatService.unmuteChat(req.params.id, req.userId!);
      res.json({ chat });
    } catch (error) {
      next(error);
    }
  }

  static async pinChat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const chat = await ChatService.pinChat(req.params.id, req.userId!);
      res.json({ chat });
    } catch (error) {
      next(error);
    }
  }

  static async unpinChat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const chat = await ChatService.unpinChat(req.params.id, req.userId!);
      res.json({ chat });
    } catch (error) {
      next(error);
    }
  }

  static async searchChats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query = (req.query.q as string) || '';
      const chats = await ChatService.searchChats(req.userId!, query);
      res.json({ chats });
    } catch (error) {
      next(error);
    }
  }

  static async getArchivedChats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const chats = await ChatService.getArchivedChats(req.userId!);
      res.json({ chats });
    } catch (error) {
      next(error);
    }
  }

  static async generateInviteLink(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ChatService.generateInviteLink(req.params.id, req.userId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  static async joinByInviteLink(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const chat = await ChatService.joinByInviteLink(req.body.inviteToken, req.userId!);
      res.json({ chat });
    } catch (error) {
      next(error);
    }
  }

  static async revokeInviteLink(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await ChatService.revokeInviteLink(req.params.id, req.userId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}