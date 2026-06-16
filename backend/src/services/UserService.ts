import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';

export class UserService {
  static async syncUser(data: {
    clerkId: string;
    username: string;
    email: string;
    fullName: string;
    avatar?: string;
  }) {
    const existingUser = await User.findOne({ clerkId: data.clerkId });
    if (existingUser) {
      existingUser.username = data.username;
      existingUser.email = data.email;
      existingUser.fullName = data.fullName;
      if (data.avatar) existingUser.avatar = data.avatar;
      return existingUser.save();
    }

    const usernameExists = await User.findOne({ username: data.username });
    if (usernameExists) {
      throw new AppError('Username already taken', 409);
    }

    return User.create(data);
  }

  static async getProfile(userId: string) {
    const user = await User.findById(userId).select('-__v');
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  static async updateProfile(
    userId: string,
    data: {
      username?: string;
      fullName?: string;
      bio?: string;
      avatar?: string;
    }
  ) {
    if (data.username) {
      const existing = await User.findOne({
        username: data.username,
        _id: { $ne: userId },
      });
      if (existing) throw new AppError('Username already taken', 409);
    }

    const user = await User.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true,
    });
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  static async searchUsers(query: string, currentUserId?: string) {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = new RegExp(escapedQuery, 'i');
    const filter: Record<string, unknown> = {
      $or: [
        { username: searchRegex },
        { fullName: searchRegex },
      ],
    };
    if (currentUserId) {
      filter._id = { $ne: currentUserId };
    }
    return User.find(filter)
      .select('username fullName avatar isOnline lastSeen')
      .limit(20)
      .lean();
  }

  static async updatePresence(userId: string, isOnline: boolean) {
    return User.findByIdAndUpdate(
      userId,
      { isOnline, lastSeen: new Date() },
      { new: true }
    );
  }

  static async updateSettings(
    userId: string,
    settings: {
      readReceipts?: boolean;
      showOnlineStatus?: boolean;
      showLastSeen?: boolean;
      showTypingIndicators?: boolean;
    }
  ) {
    const update: Record<string, unknown> = {};
    if (settings.readReceipts !== undefined) update['settings.readReceipts'] = settings.readReceipts;
    if (settings.showOnlineStatus !== undefined) update['settings.showOnlineStatus'] = settings.showOnlineStatus;
    if (settings.showLastSeen !== undefined) update['settings.showLastSeen'] = settings.showLastSeen;
    if (settings.showTypingIndicators !== undefined) update['settings.showTypingIndicators'] = settings.showTypingIndicators;

    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  static async getPrivacySettings(userId: string) {
    const user = await User.findById(userId).select('settings');
    if (!user) throw new AppError('User not found', 404);
    return user.settings;
  }
}