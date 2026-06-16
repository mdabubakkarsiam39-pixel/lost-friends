import { api } from '@/lib/api'

interface FriendRequest {
  id: string
  senderId: string
  receiverId: string
  status: 'pending' | 'accepted' | 'rejected'
  sender: { id: string; username: string; avatar?: string }
  createdAt: string
}

interface Friend {
  id: string
  username: string
  avatar?: string
  bio?: string
}

export const friendService = {
  sendRequest: (receiverId: string) =>
    api.post<FriendRequest>('/friends/request', { receiverId }),

  acceptRequest: (friendId: string) =>
    api.post<FriendRequest>('/friends/accept', { friendId }),

  rejectRequest: (friendId: string) =>
    api.post<FriendRequest>('/friends/reject', { friendId }),

  getFriends: () =>
    api.get<Friend[]>('/users/friends'),

  getPendingRequests: () =>
    api.get<FriendRequest[]>('/users/requests'),

  blockUser: (receiverId: string) =>
    api.post<void>('/friends/block', { receiverId }),

  unblockUser: (receiverId: string) =>
    api.post<void>('/friends/unblock', { receiverId }),

  removeFriend: (friendId: string) =>
    api.delete<void>(`/friends/${friendId}`),
}
