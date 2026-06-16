import { create } from 'zustand'
import { authService } from '@/services/auth'

interface User {
  id: string
  email: string
  username: string
  avatar?: string
  bio?: string
  clerkId: string
}

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (user: User, token: string, refreshToken: string) => void
  logout: () => Promise<void>
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('auth-token'),
  refreshToken: localStorage.getItem('refresh-token'),
  isAuthenticated: !!localStorage.getItem('auth-token'),
  login: (user, token, refreshToken) => {
    localStorage.setItem('auth-token', token)
    localStorage.setItem('refresh-token', refreshToken)
    set({ user, token, refreshToken, isAuthenticated: true })
  },
  logout: async () => {
    try {
      await authService.logout()
    } catch {
      // ignore
    }
    localStorage.removeItem('auth-token')
    localStorage.removeItem('refresh-token')
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false })
  },
  setUser: (user) => set({ user }),
}))
