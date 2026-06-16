import { api } from "./api";
import type { User } from "@/types";

export const userService = {
  searchUsers: (query: string) =>
    api.get<User[]>("/users/search", { q: query }),
  getUser: (id: string) => api.get<User>(`/users/${id}`),
  updateProfile: (data: { username?: string; bio?: string }) =>
    api.put<User>("/users/profile", data),
  globalSearch: (query: string) =>
    api.get<{ users: User[]; messages: any[]; chats: any[] }>("/users/search/all", { q: query }),
  getPrivacySettings: () =>
    api.get<{ readReceipts: boolean; showOnlineStatus: boolean; showLastSeen: boolean; showTypingIndicators: boolean }>("/users/settings"),
  updatePrivacySettings: (settings: { readReceipts?: boolean; showOnlineStatus?: boolean; showLastSeen?: boolean; showTypingIndicators?: boolean }) =>
    api.put<{ readReceipts: boolean; showOnlineStatus: boolean; showLastSeen: boolean; showTypingIndicators: boolean }>("/users/settings", settings),
};
