import { api } from "./api";
import type { Chat, Message, PaginatedResponse } from "@/types";

export const chatService = {
  getChats: () => api.get<Chat[]>("/chats"),
  getChat: (id: string) => api.get<Chat>(`/chats/${id}`),
  getMessages: (chatId: string, cursor?: string) =>
    api.get<PaginatedResponse<Message>>(`/messages/${chatId}`, {
      ...(cursor ? { cursor } : {}),
    }),
  createChat: (participantId: string) =>
    api.post<Chat>("/chats", { participantId }),
  createGroupChat: (data: { name: string; participants: string[] }) =>
    api.post<Chat>("/chats/group", data),
  sendMessage: (chatId: string, content: string) =>
    api.post<Message>("/messages", { chatId, content }),
  editMessage: (id: string, content: string) =>
    api.put<Message>(`/messages/${id}`, { content }),
  deleteMessage: (id: string) =>
    api.delete(`/messages/${id}`),
  addReaction: (id: string, emoji: string) =>
    api.put<Message>(`/messages/${id}/reaction`, { emoji }),
  removeReaction: (id: string, emoji: string) =>
    api.delete(`/messages/${id}/reaction`),
  pinMessage: (id: string) =>
    api.put<Message>(`/messages/${id}/pin`),
  unpinMessage: (id: string) =>
    api.delete(`/messages/${id}/pin`),
  getPinnedMessages: (chatId: string) =>
    api.get<Message[]>(`/messages/chat/${chatId}/pinned`),
  forwardMessage: (id: string, targetChatId: string) =>
    api.post<Message>(`/messages/${id}/forward`, { targetChatId }),
  searchChats: (query: string) =>
    api.get<Chat[]>("/chats/search", { q: query }),
  archiveChat: (chatId: string) =>
    api.post<Chat>(`/chats/${chatId}/archive`),
  unarchiveChat: (chatId: string) =>
    api.post<Chat>(`/chats/${chatId}/unarchive`),
  muteChat: (chatId: string) =>
    api.post<Chat>(`/chats/${chatId}/mute`),
  unmuteChat: (chatId: string) =>
    api.post<Chat>(`/chats/${chatId}/unmute`),
  pinChat: (chatId: string) =>
    api.post<Chat>(`/chats/${chatId}/pin`),
  unpinChat: (chatId: string) =>
    api.post<Chat>(`/chats/${chatId}/unpin`),
  addMember: (chatId: string, userId: string) =>
    api.post<Chat>(`/chats/${chatId}/members`, { userId }),
  removeMember: (chatId: string, userId: string) =>
    api.delete<Chat>(`/chats/${chatId}/members/${userId}`),
  getArchivedChats: () =>
    api.get<Chat[]>("/chats/archived"),
  generateInviteLink: (chatId: string) =>
    api.post<{ inviteToken: string; inviteLink: string }>(`/chats/${chatId}/invite`),
  joinByInviteLink: (inviteToken: string) =>
    api.post<Chat>("/chats/join", { inviteToken }),
  revokeInviteLink: (chatId: string) =>
    api.post<{ inviteToken: string }>(`/chats/${chatId}/invite/revoke`),
};
