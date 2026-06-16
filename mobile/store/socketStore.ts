import { create } from "zustand";

interface SocketState {
  isConnected: boolean;
  typingUserId: string | null;
  typingUsername: string | null;
  onlineUsers: string[];
  setConnected: (connected: boolean) => void;
  setTypingUserId: (userId: string | null) => void;
  setTypingUsername: (username: string | null) => void;
  addOnlineUser: (userId: string) => void;
  removeOnlineUser: (userId: string) => void;
  setOnlineUsers: (users: string[]) => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  isConnected: false,
  typingUserId: null,
  typingUsername: null,
  onlineUsers: [],
  setConnected: (connected) => set({ isConnected: connected }),
  setTypingUserId: (userId) => set({ typingUserId: userId }),
  setTypingUsername: (username) => set({ typingUsername: username }),
  addOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.includes(userId)
        ? state.onlineUsers
        : [...state.onlineUsers, userId],
    })),
  removeOnlineUser: (userId) =>
    set((state) => ({
      onlineUsers: state.onlineUsers.filter((id) => id !== userId),
    })),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
}));
