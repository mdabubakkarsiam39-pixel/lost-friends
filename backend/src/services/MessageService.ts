import { Message } from '../models/Message';
import { Chat } from '../models/Chat';
import { User } from '../models/User';
import { Friend } from '../models/Friend';
import { AppError } from '../middleware/errorHandler';
import { PushNotificationService } from './PushNotificationService';

async function parseMentions(content: string, chatId: string, senderId: string) {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }

  if (mentions.length === 0) return;

  const users = await User.find({ username: { $in: mentions }, _id: { $ne: senderId } });

  for (const user of users) {
    await PushNotificationService.notifyMention(
      user._id.toString(),
      (await User.findById(senderId))?.username || 'Someone',
      chatId
    );
  }
}

export class MessageService {
  static async sendMessage(data: {
    chatId: string;
    senderId: string;
    type?: string;
    content: string;
    mediaUrl?: string;
    fileName?: string;
    fileSize?: number;
    duration?: number;
    replyTo?: string;
  }) {
    const chat = await Chat.findOne({
      _id: data.chatId,
      participants: data.senderId,
    });
    if (!chat) throw new AppError('Chat not found', 404);

    for (const participantId of chat.participants) {
      if (participantId.toString() === data.senderId) continue;
      const blockExists = await Friend.findOne({
        $or: [
          { senderId: data.senderId, receiverId: participantId, status: 'blocked' },
          { senderId: participantId, receiverId: data.senderId, status: 'blocked' },
        ],
      });
      if (blockExists) {
        throw new AppError('Cannot send message to this user', 403);
      }
    }

    const message = await Message.create({
      chatId: data.chatId,
      senderId: data.senderId,
      type: data.type || 'text',
      content: data.content,
      mediaUrl: data.mediaUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      duration: data.duration,
      replyTo: data.replyTo,
      deliveredTo: [data.senderId],
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'username fullName avatar')
      .populate('replyTo');

    await Chat.findByIdAndUpdate(data.chatId, {
      lastMessage: data.content,
      lastMessageAt: new Date(),
    });

    await parseMentions(data.content, data.chatId, data.senderId);

    const participantIds = chat.participants
      .map((p) => p.toString())
      .filter((id) => id !== data.senderId);

    const sender = await User.findById(data.senderId);
    for (const participantId of participantIds) {
      const mutedChat = await Chat.findOne({
        _id: data.chatId,
        mutedBy: participantId,
      });
      if (!mutedChat) {
        await PushNotificationService.notifyNewMessage(
          participantId,
          sender?.username || 'Someone',
          data.chatId,
          data.type === 'text' ? data.content : `[${data.type}]`
        );
      }
    }

    return populatedMessage;
  }

  static async getMessages(
    chatId: string,
    userId: string,
    page: number = 1,
    limit: number = 50
  ) {
    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    });
    if (!chat) throw new AppError('Chat not found', 404);

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find({ chatId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('senderId', 'username fullName avatar')
        .populate('replyTo')
        .lean(),
      Message.countDocuments({ chatId }),
    ]);

    return {
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async markAsDelivered(messageId: string, userId: string) {
    const message = await Message.findByIdAndUpdate(
      messageId,
      { $addToSet: { deliveredTo: userId } },
      { new: true }
    );
    return message;
  }

  static async markAsRead(messageId: string, userId: string) {
    const message = await Message.findByIdAndUpdate(
      messageId,
      {
        $addToSet: { readBy: userId, deliveredTo: userId },
        status: 'read',
      },
      { new: true }
    );
    return message;
  }

  static async markAllAsRead(chatId: string, userId: string) {
    await Message.updateMany(
      { chatId, senderId: { $ne: userId }, readBy: { $ne: userId } },
      {
        $addToSet: { readBy: userId, deliveredTo: userId },
        status: 'read',
      }
    );
  }

  static async deleteMessage(messageId: string, userId: string) {
    const message = await Message.findOne({ _id: messageId, senderId: userId });
    if (!message) throw new AppError('Message not found or unauthorized', 404);
    await message.deleteOne();
    return { success: true };
  }

  static async editMessage(messageId: string, userId: string, content: string) {
    const message = await Message.findOne({ _id: messageId, senderId: userId });
    if (!message) throw new AppError('Message not found or unauthorized', 404);
    message.content = content;
    message.edited = true;
    message.editedAt = new Date();
    await message.save();
    return message;
  }

  static async addReaction(messageId: string, userId: string, emoji: string) {
    const message = await Message.findById(messageId);
    if (!message) throw new AppError('Message not found', 404);

    const reactions = message.reactions as any;
    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }
    if (!reactions[emoji].includes(userId)) {
      reactions[emoji].push(userId);
    }
    message.markModified('reactions');
    await message.save();
    return message;
  }

  static async removeReaction(messageId: string, userId: string, emoji: string) {
    const message = await Message.findById(messageId);
    if (!message) throw new AppError('Message not found', 404);

    const reactions = message.reactions as any;
    if (reactions[emoji]) {
      reactions[emoji] = reactions[emoji].filter((id: string) => id !== userId);
      if (reactions[emoji].length === 0) {
        delete reactions[emoji];
      }
    }
    message.markModified('reactions');
    await message.save();
    return message;
  }

  static async pinMessage(messageId: string, userId: string) {
    const message = await Message.findById(messageId);
    if (!message) throw new AppError('Message not found', 404);
    message.isPinned = true;
    message.pinnedBy = userId as any;
    message.pinnedAt = new Date();
    await message.save();
    return message;
  }

  static async unpinMessage(messageId: string) {
    const message = await Message.findById(messageId);
    if (!message) throw new AppError('Message not found', 404);
    message.isPinned = false;
    message.pinnedBy = undefined;
    message.pinnedAt = undefined;
    await message.save();
    return message;
  }

  static async getPinnedMessages(chatId: string) {
    return Message.find({ chatId, isPinned: true })
      .populate('senderId', 'username fullName avatar')
      .sort({ pinnedAt: -1 });
  }

  static async forwardMessage(messageId: string, userId: string, targetChatId: string) {
    const original = await Message.findById(messageId);
    if (!original) throw new AppError('Message not found', 404);

    const chat = await Chat.findOne({ _id: targetChatId, participants: userId });
    if (!chat) throw new AppError('Target chat not found', 404);

    const forwarded = await Message.create({
      chatId: targetChatId,
      senderId: userId,
      type: original.type,
      content: original.content,
      mediaUrl: original.mediaUrl,
      fileName: original.fileName,
      forwardedFrom: original.senderId,
      status: 'sent',
      deliveredTo: [userId],
    });

    await Chat.findByIdAndUpdate(targetChatId, {
      lastMessage: original.content,
      lastMessageAt: new Date(),
    });

    return forwarded;
  }

  static async searchMessages(userId: string, query: string, chatId?: string) {
    const searchRegex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const userChats = await Chat.find({ participants: userId }).select('_id');
    const chatIds = userChats.map((c) => c._id);

    const filter: any = {
      chatId: chatId ? chatId : { $in: chatIds },
      content: searchRegex,
    };

    return Message.find(filter)
      .populate('senderId', 'username fullName avatar')
      .populate('chatId', 'name type')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
  }
}