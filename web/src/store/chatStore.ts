import { create } from 'zustand'

interface User {
  id: string
  username: string
  avatar?: string
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  sender: User
  content: string
  type: 'text' | 'image' | 'file' | 'video' | 'voice'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  edited: boolean
  editedAt?: string
  reactions?: Record<string, string[]>
  isPinned: boolean
  forwardedFrom?: string
  replyTo?: string
  status: 'sent' | 'delivered' | 'read'
  createdAt: string
}

export interface Chat {
  id: string
  participants: User[]
  lastMessage?: Message
  unreadCount: number
  createdAt: string
  updatedAt: string
  type?: 'direct' | 'group'
  isArchived?: boolean
  isMuted?: boolean
  isPinned?: boolean
}

interface ChatState {
  activeChat: string | null
  chats: Chat[]
  messages: Record<string, Message[]>
  isLoadingChats: boolean
  setActiveChat: (chatId: string | null) => void
  setChats: (chats: Chat[]) => void
  setLoadingChats: (loading: boolean) => void
  addMessage: (chatId: string, message: Message) => void
  setMessages: (chatId: string, messages: Message[]) => void
  addMessages: (chatId: string, messages: Message[]) => void
  updateMessageStatus: (chatId: string, messageId: string, status: Message['status']) => void
  incrementUnread: (chatId: string) => void
  resetUnread: (chatId: string) => void
}

export const useChatStore = create<ChatState>((set) => ({
  activeChat: null,
  chats: [],
  messages: {},
  isLoadingChats: true,
  setActiveChat: (chatId) => set({ activeChat: chatId }),
  setChats: (chats) => set({ chats, isLoadingChats: false }),
  setLoadingChats: (loading) => set({ isLoadingChats: loading }),
  addMessage: (chatId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...(state.messages[chatId] || []), message],
      },
    })),
  setMessages: (chatId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [chatId]: messages },
    })),
  addMessages: (chatId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: [...messages, ...(state.messages[chatId] || [])],
      },
    })),
  updateMessageStatus: (chatId, messageId, status) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [chatId]: (state.messages[chatId] || []).map((m) =>
          m.id === messageId ? { ...m, status } : m,
        ),
      },
    })),
  incrementUnread: (chatId) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId ? { ...c, unreadCount: c.unreadCount + 1 } : c,
      ),
    })),
  resetUnread: (chatId) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId ? { ...c, unreadCount: 0 } : c,
      ),
    })),
}))
