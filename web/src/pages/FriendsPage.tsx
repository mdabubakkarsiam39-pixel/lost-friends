import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { friendService } from '@/services/friend'
import { userService } from '@/services/user'
import { useChatStore } from '@/store/chatStore'
import { api } from '@/lib/api'

export default function FriendsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setActiveChat = useChatStore((s) => s.setActiveChat)
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: () => friendService.getFriends(),
  })

  const { data: requests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['friendRequests'],
    queryFn: () => friendService.getPendingRequests(),
  })

  const { data: searchResults = [], isLoading: searchLoading } = useQuery({
    queryKey: ['userSearch', searchQuery],
    queryFn: () => userService.searchUsers(searchQuery),
    enabled: searchQuery.length >= 2,
  })

  const acceptMutation = useMutation({
    mutationFn: (id: string) => friendService.acceptRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id: string) => friendService.rejectRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] })
    },
  })

  const sendRequestMutation = useMutation({
    mutationFn: (receiverId: string) => friendService.sendRequest(receiverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSearch'] })
    },
  })

  const blockMutation = useMutation({
    mutationFn: (receiverId: string) => friendService.blockUser(receiverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      queryClient.invalidateQueries({ queryKey: ['userSearch'] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) => friendService.removeFriend(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] })
    },
  })

  const handleStartChat = async (userId: string) => {
    try {
      const chat = await api.post<{ id: string }>('/chats', { participantId: userId })
      setActiveChat(chat.id)
      navigate(`/chat/${chat.id}`)
    } catch {}
  }

  const tabs = [
    { key: 'friends' as const, label: 'Friends', count: friends.length },
    { key: 'requests' as const, label: 'Requests', count: requests.length },
    { key: 'search' as const, label: 'Find' },
  ]

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
      <div className="px-4 pt-4 pb-2 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Friends</h1>
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-1.5 text-xs opacity-75">({tab.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {activeTab === 'friends' && (
          <>
            {friendsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : friends.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
                <p className="text-4xl mb-3">👥</p>
                <p className="font-medium">No friends yet</p>
                <p className="text-sm mt-1">Add friends to start chatting</p>
              </div>
            ) : (
              friends.map((f: any) => (
                <div
                  key={f._id || f.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
                    {(f.username || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {f.username}
                    </p>
                    {f.bio && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{f.bio}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleStartChat(f._id || f.id)}
                      className="px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-sm hover:bg-primary-700 transition-colors"
                    >
                      Chat
                    </button>
                    <button
                      onClick={() => removeMutation.mutate(f._id || f.id)}
                      className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-500 transition-colors"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => blockMutation.mutate(f._id || f.id)}
                      className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600 transition-colors"
                    >
                      Block
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'requests' && (
          <>
            {requestsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
                <p className="text-4xl mb-3">📩</p>
                <p className="font-medium">No pending requests</p>
                <p className="text-sm mt-1">Friend requests will appear here</p>
              </div>
            ) : (
              requests.map((req: any) => (
                <div
                  key={req._id || req.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
                    {(req.sender?.username || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {req.sender?.username || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Sent {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => acceptMutation.mutate(req._id || req.id)}
                      disabled={acceptMutation.isPending}
                      className="px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-sm hover:bg-primary-700 disabled:opacity-50 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => rejectMutation.mutate(req._id || req.id)}
                      disabled={rejectMutation.isPending}
                      className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-500 disabled:opacity-50 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'search' && (
          <>
            <div className="px-4 py-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username..."
                className="w-full input-field"
                autoFocus
              />
            </div>
            {searchLoading && searchQuery.length >= 2 && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            )}
            {searchQuery.length >= 2 && !searchLoading && searchResults.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-8">No users found</p>
            )}
            {searchResults.map((u: any) => (
              <div
                key={u._id || u.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800"
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
                  {(u.username || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                    {u.username}
                  </p>
                  {u.bio && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.bio}</p>
                  )}
                </div>
                <button
                  onClick={() => sendRequestMutation.mutate(u._id || u.id)}
                  disabled={sendRequestMutation.isPending}
                  className="px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-sm hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  Add Friend
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
