import { api } from "./api";
import type { Notification } from "@/types";

export const notificationService = {
  getNotifications: () => api.get<Notification[]>("/api/notifications"),
  markAsRead: (id: string) =>
    api.put<Notification>(`/api/notifications/${id}/read`),
  markAllAsRead: () =>
    api.put<Notification[]>("/api/notifications/read-all"),
};
