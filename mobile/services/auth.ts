import { api } from "./api";
import type { User } from "@/types";

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  getProfile: () => api.get<User>("/auth/me"),
  updateProfile: (data: Partial<{ name: string; bio: string; avatarUrl: string }>) =>
    api.patch<User>("/auth/me", data),
};
