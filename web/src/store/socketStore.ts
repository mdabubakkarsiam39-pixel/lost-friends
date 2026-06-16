import { create } from 'zustand'
import type { Socket } from 'socket.io-client'

interface SocketState {
  socket: Socket | null
  isConnected: boolean
  onlineUsers: string[]
  typingUsers: Record<string, { userId: string; username: string }[]>
  setSocket: (socket: Socket | null) => void
  setConnected: (connected: boolean) => void
  setOnlineUsers: (users: string[]) => void
  addOnlineUser: (userId: string) => void
  removeOnlineUser: (userId: string) => void
  setTypingUsers: (chatId: string, users: { userId: string; username: string }[]) => void
  addTypingUser: (chatId: string, user: { userId: string; username: string }) => void
  removeTypingUser: (chatId: string, userId: string) => void
}

export const useSocketStore = create<SocketState>((set) => ({
  socket: null,
  isConnected: false,
  onlineUsers: [],
  typingUsers: {},
  setSocket: (socket) => set({ socket }),
  setConnected: (connected) => set({ isConnected: connected }),
  setOnlineUsers: (users) => set({ onlineUsers: users }),
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
  setTypingUsers: (chatId, users) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [chatId]: users },
    })),
  addTypingUser: (chatId, user) =>
    set((state) => {
      const current = state.typingUsers[chatId] || []
      if (current.some((u) => u.userId === user.userId)) return state
      return {
        typingUsers: { ...state.typingUsers, [chatId]: [...current, user] },
      }
    }),
  removeTypingUser: (chatId, userId) =>
    set((state) => ({
      typingUsers: {
        ...state.typingUsers,
        [chatId]: (state.typingUsers[chatId] || []).filter((u) => u.userId !== userId),
      },
    })),
}))
