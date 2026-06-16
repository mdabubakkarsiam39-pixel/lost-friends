import { api } from '@/lib/api'

interface Notification {
  id: string
  type: 'friend_request' | 'message' | 'system'
  title: string
  description: string
  read: boolean
  createdAt: string
}

export const notificationService = {
  getNotifications: () =>
    api.get<Notification[]>('/notifications'),

  markAsRead: (id: string) =>
    api.put<void>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    api.put<void>('/notifications/read-all'),
}