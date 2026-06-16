import { api } from '@/lib/api'

interface User {
  id: string
  email: string
  username: string
  avatar?: string
  bio?: string
  clerkId: string
}

interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

export const authService = {
  syncUser: (clerkId: string, email: string, username: string) =>
    api.post<AuthResponse>('/api/auth/sync', { clerkId, email, username }),

  logout: () =>
    api.post<void>('/api/auth/logout'),

  getMe: () =>
    api.get<User>('/api/auth/me'),
}
