import { Friend } from '../models/Friend';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { FriendStatus } from '../types';
import { PushNotificationService } from './PushNotificationService';

export class FriendService {
  static async sendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throw new AppError('Cannot send friend request to yourself', 400);
    }

    const existing = await Friend.findOne({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    });

    if (existing) {
      if (existing.status === 'pending') {
        throw new AppError('Friend request already pending', 409);
      }
      if (existing.status === 'accepted') {
        throw new AppError('Already friends', 409);
      }
      if (existing.status === 'blocked') {
        throw new AppError('Unable to send request', 403);
      }
      existing.status = 'pending';
      await existing.save();
    } else {
      await Friend.create({ senderId, receiverId, status: 'pending' });
    }

    const sender = await User.findById(senderId).select('username');
    if (sender) {
      await PushNotificationService.notifyFriendRequest(receiverId, sender.username);
    }

    return existing || (await Friend.findOne({ senderId, receiverId }));
  }

  static async acceptRequest(userId: string, friendId: string) {
    const friendship = await Friend.findOne({
      _id: friendId,
      receiverId: userId,
      status: 'pending',
    });
    if (!friendship) throw new AppError('Friend request not found', 404);

    friendship.status = 'accepted';
    await friendship.save();

    const accepter = await User.findById(userId).select('username');
    if (accepter) {
      await PushNotificationService.notifyFriendAccepted(
        friendship.senderId.toString(),
        accepter.username
      );
    }

    return friendship;
  }

  static async rejectRequest(userId: string, friendId: string) {
    const friendship = await Friend.findOne({
      _id: friendId,
      receiverId: userId,
      status: 'pending',
    });
    if (!friendship) throw new AppError('Friend request not found', 404);

    friendship.status = 'rejected';
    await friendship.save();
    return { success: true };
  }

  static async removeFriend(userId: string, friendId: string) {
    const friendship = await Friend.findOne({
      _id: friendId,
      $or: [{ senderId: userId }, { receiverId: userId }],
      status: 'accepted',
    });
    if (!friendship) throw new AppError('Friendship not found', 404);

    await friendship.deleteOne();
    return { success: true };
  }

  static async blockUser(userId: string, targetId: string) {
    if (userId === targetId) {
      throw new AppError('Cannot block yourself', 400);
    }

    const existing = await Friend.findOne({
      $or: [
        { senderId: userId, receiverId: targetId },
        { senderId: targetId, receiverId: userId },
      ],
    });

    if (existing) {
      existing.status = 'blocked';
      return existing.save();
    }

    return Friend.create({
      senderId: userId,
      receiverId: targetId,
      status: 'blocked',
    });
  }

  static async unblockUser(userId: string, targetId: string) {
    const friendship = await Friend.findOne({
      senderId: userId,
      receiverId: targetId,
      status: 'blocked',
    });
    if (!friendship) throw new AppError('Block not found', 404);

    await friendship.deleteOne();
    return { success: true };
  }

  static async isBlocked(userId: string, targetId: string): Promise<boolean> {
    const block = await Friend.findOne({
      $or: [
        { senderId: userId, receiverId: targetId, status: 'blocked' },
        { senderId: targetId, receiverId: userId, status: 'blocked' },
      ],
    });
    return !!block;
  }

  static async getFriends(userId: string) {
    const friendships = await Friend.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
      status: 'accepted',
    }).populate('senderId receiverId', 'username fullName avatar isOnline');

    return friendships.map((f) => {
      const sender = f.senderId as unknown as { _id: string; username: string; fullName: string; avatar: string; isOnline: boolean };
      const receiver = f.receiverId as unknown as { _id: string; username: string; fullName: string; avatar: string; isOnline: boolean };
      return sender._id.toString() === userId ? receiver : sender;
    });
  }

  static async getPendingRequests(userId: string) {
    return Friend.find({ receiverId: userId, status: 'pending' })
      .populate('senderId', 'username fullName avatar')
      .sort({ createdAt: -1 });
  }

  static async getFriendshipStatus(
    userId: string,
    targetId: string
  ): Promise<FriendStatus | null> {
    const friendship = await Friend.findOne({
      $or: [
        { senderId: userId, receiverId: targetId },
        { senderId: targetId, receiverId: userId },
      ],
    });
    return friendship ? friendship.status : null;
  }
}