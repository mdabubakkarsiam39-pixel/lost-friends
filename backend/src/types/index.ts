import { Types } from 'mongoose';

export interface IUser {
  clerkId: string;
  username: string;
  email: string;
  fullName: string;
  bio: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: Date;
  settings: {
    readReceipts: boolean;
    showOnlineStatus: boolean;
    showLastSeen: boolean;
    showTypingIndicators: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IFriend {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  status: FriendStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type FriendStatus = 'pending' | 'accepted' | 'blocked' | 'rejected';

export interface IChat {
  type: ChatType;
  participants: Types.ObjectId[];
  name?: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageAt?: Date;
  createdBy: Types.ObjectId;
  admins: Types.ObjectId[];
  isArchived: boolean;
  isPinned: boolean;
  mutedBy: Types.ObjectId[];
  inviteToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ChatType = 'private' | 'group';

export interface IMessage {
  chatId: Types.ObjectId;
  senderId: Types.ObjectId;
  type: MessageType;
  content: string;
  mediaUrl?: string;
  mediaThumbnail?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  status: MessageStatus;
  edited: boolean;
  editedAt?: Date;
  reactions: Map<string, Types.ObjectId[]>;
  isPinned: boolean;
  pinnedBy?: Types.ObjectId;
  pinnedAt?: Date;
  forwardedFrom?: Types.ObjectId;
  readBy: Types.ObjectId[];
  deliveredTo: Types.ObjectId[];
  replyTo?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type MessageType = 'text' | 'image' | 'video' | 'file' | 'voice';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface INotification {
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
}

export type NotificationType =
  | 'new_message'
  | 'friend_request'
  | 'friend_accepted'
  | 'mention'
  | 'group_invite'
  | 'group_update';

export interface IPushToken {
  userId: Types.ObjectId;
  token: string;
  platform: 'ios' | 'android' | 'web';
  createdAt: Date;
}

export interface SocketUser {
  userId: string;
  socketId: string;
  chats: string[];
}

export interface TypingData {
  chatId: string;
  userId: string;
  username: string;
}

export interface MessageData {
  chatId: string;
  message: IMessage;
}

export interface PresenceData {
  userId: string;
  isOnline: boolean;
  lastSeen?: Date;
}