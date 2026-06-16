import { api } from '@/lib/api'
import type { Chat, Message } from '@/store/chatStore'

export const chatService = {
  getChats: () =>
    api.get<Chat[]>('/chats'),

  searchChats: (query: string) =>
    api.get<Chat[]>(`/chats/search?q=${encodeURIComponent(query)}`),

  getChat: (id: string) =>
    api.get<Chat>(`/chats/${id}`),

  createChat: (participantId: string) =>
    api.post<Chat>('/chats', { participantId }),

  createGroupChat: (name: string, participants: string[]) =>
    api.post<Chat>('/chats/group', { name, participants }),

  getMessages: (chatId: string, page: number = 1, limit: number = 50) =>
    api.get<{ messages: Message[]; pagination: { page: number; limit: number; total: number; pages: number } }>(
      `/messages/${chatId}?page=${page}&limit=${limit}`
    ),

  sendMessage: (chatId: string, content: string, type: Message['type'] = 'text', mediaUrl?: string) =>
    api.post<Message>('/messages', { chatId, content, type, mediaUrl }),

  deleteMessage: (id: string) =>
    api.delete<void>(`/messages/${id}`),

  editMessage: (id: string, content: string) =>
    api.put<Message>(`/messages/${id}`, { content }),

  addReaction: (id: string, emoji: string) =>
    api.put<Message>(`/messages/${id}/reaction`, { emoji }),

  removeReaction: (id: string, emoji: string) =>
    api.delete<void>(`/messages/${id}/reaction`, { body: JSON.stringify({ emoji }) }),

  pinMessage: (id: string) =>
    api.put<Message>(`/messages/${id}/pin`),

  unpinMessage: (id: string) =>
    api.delete<void>(`/messages/${id}/pin`),

  getPinnedMessages: (chatId: string) =>
    api.get<Message[]>(`/messages/chat/${chatId}/pinned`),

  forwardMessage: (id: string, targetChatId: string) =>
    api.post<Message>(`/messages/${id}/forward`, { targetChatId }),

  archiveChat: (id: string) =>
    api.put<Chat>(`/chats/${id}/archive`),

  unarchiveChat: (id: string) =>
    api.delete<Chat>(`/chats/${id}/archive`),

  muteChat: (id: string) =>
    api.put<Chat>(`/chats/${id}/mute`),

  unmuteChat: (id: string) =>
    api.delete<Chat>(`/chats/${id}/mute`),

  pinChat: (id: string) =>
    api.put<Chat>(`/chats/${id}/pin`),

  unpinChat: (id: string) =>
    api.delete<Chat>(`/chats/${id}/pin`),

  searchMessages: (query: string, chatId?: string) =>
    api.get<Message[]>(`/messages/search?q=${encodeURIComponent(query)}${chatId ? `&chatId=${chatId}` : ''}`),

  getArchivedChats: () =>
    api.get<Chat[]>('/chats/archived'),

  generateInviteLink: (chatId: string) =>
    api.post<{ inviteToken: string; inviteLink: string }>(`/chats/${chatId}/invite`),

  joinByInviteLink: (inviteToken: string) =>
    api.post<Chat>('/chats/join', { inviteToken }),

  revokeInviteLink: (chatId: string) =>
    api.post<{ inviteToken: string }>(`/chats/${chatId}/invite/revoke`),
}