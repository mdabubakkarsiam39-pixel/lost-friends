import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'
import { ChatListItem } from '@/components/ChatListItem'
import { useNavigate } from 'react-router-dom'
import { userService } from '@/services/user'
import { api } from '@/lib/api'

export default function ChatListPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { chats, setActiveChat, isLoadingChats } = useChatStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ users: any[]; messages: any[]; chats: any[] } | null>(null)
  const [searching, setSearching] = useState(false)

  const handleSearch = async (q: string) => {
    setQuery(q)
    if (q.trim().length < 2) {
      setResults(null)
      return
    }
    setSearching(true)
    try {
      const data = await userService.globalSearch(q)
      setResults(data)
    } catch {}
    setSearching(false)
  }

  if (results) {
    return (
      <div className="flex-1 lg:hidden flex flex-col">
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search users, messages, chats..."
              className="flex-1 input-field"
              autoFocus
            />
            <button onClick={() => { setResults(null); setQuery('') }} className="text-sm text-primary">
              Cancel
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {searching && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          )}
          {results.users.length > 0 && (
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Users</p>
              {results.users.map((u) => (
                <div
                key={u._id}
                onClick={async () => {
                  try {
                    const chat = await api.post<{ id: string }>('/chats', { participantId: u._id })
                    setActiveChat(chat.id)
                    navigate(`/chat/${chat.id}`)
                  } catch {}
                }}
                className="py-2 flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-2"
              >
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm">
                    {u.username[0]}
                  </div>
                  <span className="text-sm text-gray-900 dark:text-gray-100">{u.username}</span>
                </div>
              ))}
            </div>
          )}
          {results.chats.length > 0 && (
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Chats</p>
              {results.chats.map((c) => (
                <div
                  key={c._id}
                  onClick={() => { setActiveChat(c._id); navigate(`/chat/${c._id}`) }}
                  className="py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-2"
                >
                  <p className="text-sm text-gray-900 dark:text-gray-100">{c.name || 'Chat'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{c.lastMessage}</p>
                </div>
              ))}
            </div>
          )}
          {results.messages.length > 0 && (
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Messages</p>
              {results.messages.slice(0, 10).map((m: any) => (
                <div key={m._id} className="py-2">
                  <p className="text-sm text-gray-900 dark:text-gray-100 truncate">{m.content}</p>
                </div>
              ))}
            </div>
          )}
          {!searching && results.users.length === 0 && results.chats.length === 0 && results.messages.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-8">No results found</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 lg:hidden flex flex-col">
      <div className="px-4 pt-3 pb-2">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search users, messages, chats..."
          className="w-full input-field"
        />
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoadingChats ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : chats.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center px-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No chats yet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Start a conversation with a friend</p>
            </div>
          </div>
        ) : (
          chats.map((chat) => {
            const other = chat.participants.find((p) => p.id !== user?.id)
            return (
              <ChatListItem
                key={chat.id}
                chat={chat}
                otherUser={other}
                isActive={false}
                onClick={() => {
                  setActiveChat(chat.id)
                  navigate(`/chat/${chat.id}`)
                }}
              />
            )
          })
        )}
      </div>
    </div>
  )
}
