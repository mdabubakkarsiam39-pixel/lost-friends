import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  setAuthenticated: (userId: string) => void;
  setUnauthenticated: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  userId: null,
  setAuthenticated: (userId) => set({ isAuthenticated: true, userId }),
  setUnauthenticated: () => set({ isAuthenticated: false, userId: null }),
}));
