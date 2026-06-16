import { Chat } from '../models/Chat';
import { Message } from '../models/Message';
import { AppError } from '../middleware/errorHandler';
import crypto from 'crypto';

export class ChatService {
  static async createPrivateChat(userId: string, participantId: string) {
    const existingChat = await Chat.findOne({
      type: 'private',
      participants: { $all: [userId, participantId], $size: 2 },
    });

    if (existingChat) return existingChat;

    return Chat.create({
      type: 'private',
      participants: [userId, participantId],
      createdBy: userId,
      admins: [userId],
    });
  }

  static async createGroupChat(
    userId: string,
    data: { name: string; participants: string[] }
  ) {
    const allParticipants = [...new Set([userId, ...data.participants])];
    if (allParticipants.length < 2) {
      throw new AppError('Group must have at least 2 participants', 400);
    }

    return Chat.create({
      type: 'group',
      name: data.name,
      participants: allParticipants,
      createdBy: userId,
      admins: [userId],
    });
  }

  static async getUserChats(userId: string) {
    return Chat.find({ participants: userId, isArchived: false })
      .populate('participants', 'username fullName avatar isOnline lastSeen')
      .sort({ isPinned: -1, lastMessageAt: -1, updatedAt: -1 })
      .lean();
  }

  static async getChatById(chatId: string, userId: string) {
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    }).populate('participants', 'username fullName avatar isOnline lastSeen');

    if (!chat) throw new AppError('Chat not found', 404);
    return chat;
  }

  static async updateLastMessage(chatId: string, message: string) {
    return Chat.findByIdAndUpdate(
      chatId,
      { lastMessage: message, lastMessageAt: new Date() },
      { new: true }
    );
  }

  static async deleteChat(chatId: string, userId: string) {
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    });
    if (!chat) throw new AppError('Chat not found', 404);

    await chat.deleteOne();
    return { success: true };
  }

  static async addMember(chatId: string, userId: string, newMemberId: string) {
    const chat = await Chat.findOne({ _id: chatId, admins: userId });
    if (!chat) throw new AppError('Chat not found or not admin', 404);

    if (chat.participants.includes(newMemberId as any)) {
      throw new AppError('User already in chat', 409);
    }

    chat.participants.push(newMemberId as any);
    return chat.save();
  }

  static async removeMember(chatId: string, userId: string, memberId: string) {
    const chat = await Chat.findOne({ _id: chatId, admins: userId });
    if (!chat) throw new AppError('Chat not found or not admin', 404);

    chat.participants = chat.participants.filter(
      (p) => p.toString() !== memberId
    );
    return chat.save();
  }

  static async archiveChat(chatId: string, userId: string) {
    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, participants: userId },
      { isArchived: true },
      { new: true }
    );
    if (!chat) throw new AppError('Chat not found', 404);
    return chat;
  }

  static async unarchiveChat(chatId: string, userId: string) {
    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, participants: userId },
      { isArchived: false },
      { new: true }
    );
    if (!chat) throw new AppError('Chat not found', 404);
    return chat;
  }

  static async muteChat(chatId: string, userId: string) {
    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, participants: userId },
      { $addToSet: { mutedBy: userId } },
      { new: true }
    );
    if (!chat) throw new AppError('Chat not found', 404);
    return chat;
  }

  static async unmuteChat(chatId: string, userId: string) {
    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, participants: userId },
      { $pull: { mutedBy: userId } },
      { new: true }
    );
    if (!chat) throw new AppError('Chat not found', 404);
    return chat;
  }

  static async pinChat(chatId: string, userId: string) {
    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, participants: userId },
      { isPinned: true },
      { new: true }
    );
    if (!chat) throw new AppError('Chat not found', 404);
    return chat;
  }

  static async unpinChat(chatId: string, userId: string) {
    const chat = await Chat.findOneAndUpdate(
      { _id: chatId, participants: userId },
      { isPinned: false },
      { new: true }
    );
    if (!chat) throw new AppError('Chat not found', 404);
    return chat;
  }

  static async searchChats(userId: string, query: string) {
    const searchRegex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    return Chat.find({
      participants: userId,
      $or: [
        { name: searchRegex },
        { lastMessage: searchRegex },
      ],
    })
      .populate('participants', 'username fullName avatar isOnline')
      .sort({ lastMessageAt: -1 })
      .limit(20)
      .lean();
  }

  static async getArchivedChats(userId: string) {
    return Chat.find({ participants: userId, isArchived: true })
      .populate('participants', 'username fullName avatar isOnline lastSeen')
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .lean();
  }

  static async generateInviteLink(chatId: string, userId: string) {
    const chat = await Chat.findOne({ _id: chatId, participants: userId });
    if (!chat) throw new AppError('Chat not found', 404);
    if (chat.type === 'private') throw new AppError('Cannot generate invite for private chats', 400);

    if (!chat.inviteToken) {
      chat.inviteToken = crypto.randomBytes(16).toString('hex');
      await chat.save();
    }

    return { inviteToken: chat.inviteToken, inviteLink: `/invite/${chat.inviteToken}` };
  }

  static async joinByInviteLink(inviteToken: string, userId: string) {
    const chat = await Chat.findOne({ inviteToken });
    if (!chat) throw new AppError('Invalid invite link', 404);
    if (chat.type === 'private') throw new AppError('Cannot join private chat via invite', 400);

    if (chat.participants.includes(userId as any)) {
      return chat;
    }

    chat.participants.push(userId as any);
    await chat.save();

    return Chat.findById(chat._id).populate('participants', 'username fullName avatar isOnline lastSeen');
  }

  static async revokeInviteLink(chatId: string, userId: string) {
    const chat = await Chat.findOne({ _id: chatId, createdBy: userId });
    if (!chat) throw new AppError('Chat not found or not creator', 404);

    chat.inviteToken = crypto.randomBytes(16).toString('hex');
    await chat.save();

    return { inviteToken: chat.inviteToken };
  }
}