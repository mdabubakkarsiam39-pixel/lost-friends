export interface User {
  id: string;
  name: string;
  username: string;
  fullName?: string;
  email: string;
  avatarUrl?: string;
  online: boolean;
  bio?: string;
  lastSeen?: string;
  createdAt?: string;
}

export interface Chat {
  id: string;
  name?: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
  type: "direct" | "group";
  isArchived?: boolean;
  isMuted?: boolean;
  isPinned?: boolean;
  creatorId?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  voiceUrl?: string;
  fileUrl?: string;
  fileName?: string;
  edited: boolean;
  editedAt?: string;
  reactions?: Record<string, string[]>;
  isPinned: boolean;
  forwardedFrom?: string;
  replyTo?: string;
  status: "sending" | "sent" | "delivered" | "read";
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type?: string;
  read: boolean;
  createdAt: string;
}

export interface FriendshipStatus {
  status: "none" | "pending_sent" | "pending_received" | "friends" | "blocked";
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}
