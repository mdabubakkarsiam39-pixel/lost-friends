import { api } from "./api";
import type { User, FriendshipStatus } from "@/types";

export const friendService = {
  getFriends: () => api.get<User[]>("/users/friends"),
  getRequests: () => api.get<User[]>("/users/requests"),
  sendRequest: (receiverId: string) =>
    api.post<User>("/friends/request", { receiverId }),
  acceptRequest: (friendId: string) =>
    api.post<User>("/friends/accept", { friendId }),
  rejectRequest: (friendId: string) =>
    api.post<User>("/friends/reject", { friendId }),
  removeFriend: (friendId: string) =>
    api.delete(`/friends/${friendId}`),
  blockUser: (receiverId: string) =>
    api.post<User>("/friends/block", { receiverId }),
  unblockUser: (receiverId: string) =>
    api.post<User>("/friends/unblock", { receiverId }),
  getFriendshipStatus: (targetId: string) =>
    api.get<FriendshipStatus>(`/users/friendship/${targetId}`),
};
