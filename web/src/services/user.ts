import { api } from '@/lib/api'

interface UserProfile {
  id: string
  email: string
  username: string
  avatar?: string
  bio?: string
  clerkId: string
}

interface UpdateProfileData {
  username?: string
  bio?: string
  avatar?: string
}

export const userService = {
  getProfile: (id: string) =>
    api.get<UserProfile>(`/users/${id}`),

  updateProfile: (data: UpdateProfileData) =>
    api.put<UserProfile>('/users/profile', data),

  uploadAvatar: (formData: FormData) =>
    api.post<UserProfile>('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  searchUsers: (query: string) =>
    api.get<UserProfile[]>('/users/search', { params: { q: query } }),

  globalSearch: (query: string) =>
    api.get<{ users: UserProfile[]; messages: any[]; chats: any[] }>('/users/search/all', { params: { q: query } }),

  getPrivacySettings: () =>
    api.get<{ readReceipts: boolean; showOnlineStatus: boolean; showLastSeen: boolean; showTypingIndicators: boolean }>('/users/settings'),

  updatePrivacySettings: (settings: { readReceipts?: boolean; showOnlineStatus?: boolean; showLastSeen?: boolean; showTypingIndicators?: boolean }) =>
    api.put<{ readReceipts: boolean; showOnlineStatus: boolean; showLastSeen: boolean; showTypingIndicators: boolean }>('/users/settings', settings),
}
