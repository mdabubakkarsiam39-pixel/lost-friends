import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserService } from '../services/UserService';
import { MessageService } from '../services/MessageService';
import { User } from '../models/User';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  username?: string;
}

const onlineUsers = new Map<string, Set<string>>();

export function createSocketServer(httpServer: HTTPServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: config.cors.origin,
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      try {
        const decoded = jwt.verify(token as string, config.jwt.secret) as {
          userId: string;
          clerkId: string;
        };

        const user = await User.findById(decoded.userId);
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = decoded.userId;
        socket.username = user.username;
        next();
      } catch {
        next(new Error('Invalid token'));
      }
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', async (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);

    await UserService.updatePresence(userId, true);
    io.emit('user:online', { userId });
    socket.broadcast.emit('presence:update', {
      userId,
      isOnline: true,
    });

    socket.on('join:chat', async (chatId: string) => {
      socket.join(`chat:${chatId}`);

      try {
        const { Message } = await import('../models/Message');
        await Message.updateMany(
          { chatId, senderId: { $ne: userId }, deliveredTo: { $ne: userId } },
          { $addToSet: { deliveredTo: userId } }
        );

        io.to(`chat:${chatId}`).emit('chat:member_joined', {
          chatId,
          userId,
          username: socket.username,
        });
      } catch (error) {
        console.error('Error joining chat:', error);
      }
    });

    socket.on('leave:chat', (chatId: string) => {
      socket.leave(`chat:${chatId}`);
      io.to(`chat:${chatId}`).emit('chat:member_left', {
        chatId,
        userId,
        username: socket.username,
      });
    });

    socket.on('message:send', async (data, callback) => {
      try {
        const message = await MessageService.sendMessage({
          ...data,
          senderId: userId,
        });

        io.to(`chat:${data.chatId}`).emit('message:new', {
          message,
        });

        socket.to(`chat:${data.chatId}`).emit('message:delivered', {
          messageId: message!._id,
          chatId: data.chatId,
        });

        if (callback) callback({ success: true, message });
      } catch (error) {
        console.error('Error sending message:', error);
        if (callback) callback({ error: 'Failed to send message' });
      }
    });

    socket.on('typing:start', (data: { chatId: string }) => {
      socket.to(`chat:${data.chatId}`).emit('typing:update', {
        chatId: data.chatId,
        userId,
        username: socket.username,
        isTyping: true,
      });
    });

    socket.on('typing:stop', (data: { chatId: string }) => {
      socket.to(`chat:${data.chatId}`).emit('typing:update', {
        chatId: data.chatId,
        userId,
        username: socket.username,
        isTyping: false,
      });
    });

    socket.on('message:read', async (data: { chatId: string; messageId: string }) => {
      try {
        await MessageService.markAsRead(data.messageId, userId);
        io.to(`chat:${data.chatId}`).emit('message:read', {
          messageId: data.messageId,
          chatId: data.chatId,
          userId,
        });
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    socket.on('message:edit', async (data: { chatId: string; messageId: string; content: string }) => {
      try {
        const message = await MessageService.editMessage(data.messageId, userId, data.content);
        io.to(`chat:${data.chatId}`).emit('message:edited', {
          messageId: data.messageId,
          chatId: data.chatId,
          content: data.content,
          editedAt: message.editedAt,
        });
      } catch (error) {
        console.error('Error editing message:', error);
      }
    });

    socket.on('message:reaction', async (data: { chatId: string; messageId: string; emoji: string }) => {
      try {
        const message = await MessageService.addReaction(data.messageId, userId, data.emoji);
        io.to(`chat:${data.chatId}`).emit('message:reaction', {
          messageId: data.messageId,
          chatId: data.chatId,
          emoji: data.emoji,
          userId,
          reactions: message.reactions,
        });
      } catch (error) {
        console.error('Error adding reaction:', error);
      }
    });

    socket.on('message:unreaction', async (data: { chatId: string; messageId: string; emoji: string }) => {
      try {
        const message = await MessageService.removeReaction(data.messageId, userId, data.emoji);
        io.to(`chat:${data.chatId}`).emit('message:reaction', {
          messageId: data.messageId,
          chatId: data.chatId,
          emoji: data.emoji,
          userId,
          reactions: message.reactions,
        });
      } catch (error) {
        console.error('Error removing reaction:', error);
      }
    });

    socket.on('message:pin', async (data: { chatId: string; messageId: string }) => {
      try {
        await MessageService.pinMessage(data.messageId, userId);
        io.to(`chat:${data.chatId}`).emit('message:pinned', {
          messageId: data.messageId,
          chatId: data.chatId,
          userId,
        });
      } catch (error) {
        console.error('Error pinning message:', error);
      }
    });

    socket.on('message:unpin', async (data: { chatId: string; messageId: string }) => {
      try {
        await MessageService.unpinMessage(data.messageId);
        io.to(`chat:${data.chatId}`).emit('message:unpinned', {
          messageId: data.messageId,
          chatId: data.chatId,
        });
      } catch (error) {
        console.error('Error unpinning message:', error);
      }
    });

    socket.on('message:forward', async (data: { messageId: string; targetChatId: string }) => {
      try {
        const message = await MessageService.forwardMessage(data.messageId, userId, data.targetChatId);
        io.to(`chat:${data.targetChatId}`).emit('message:new', { message });
        socket.emit('message:forwarded', { messageId: data.messageId, targetChatId: data.targetChatId });
      } catch (error) {
        console.error('Error forwarding message:', error);
      }
    });

    socket.on('message:reply', async (data: { chatId: string; content: string; replyTo: string }) => {
      try {
        const message = await MessageService.sendMessage({
          chatId: data.chatId,
          senderId: userId,
          content: data.content,
          replyTo: data.replyTo,
        });
        io.to(`chat:${data.chatId}`).emit('message:new', { message });
        socket.to(`chat:${data.chatId}`).emit('message:delivered', {
          messageId: message!._id,
          chatId: data.chatId,
        });
      } catch (error) {
        console.error('Error sending reply:', error);
      }
    });

    socket.on('notification:read', async (data: { notificationId: string }) => {
      try {
        const { Notification } = await import('../models/Notification');
        await Notification.findOneAndUpdate(
          { _id: data.notificationId, userId },
          { read: true }
        );
        socket.emit('notification:updated', { notificationId: data.notificationId });
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    });

    socket.on('disconnect', async () => {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          await UserService.updatePresence(userId, false);
          io.emit('user:offline', { userId });
          io.emit('presence:update', {
            userId,
            isOnline: false,
            lastSeen: new Date(),
          });
        }
      }
    });
  });

  return io;
}

export function getOnlineUsers(): string[] {
  return Array.from(onlineUsers.keys());
}

export function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId) && (onlineUsers.get(userId)?.size ?? 0) > 0;
}