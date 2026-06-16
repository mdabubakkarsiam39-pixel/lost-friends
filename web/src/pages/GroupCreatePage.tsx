import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { userService } from '@/services/user'
import { chatService } from '@/services/chat'
import { useChatStore } from '@/store/chatStore'

export default function GroupCreatePage() {
  const navigate = useNavigate()
  const setActiveChat = useChatStore((s) => s.setActiveChat)
  const [name, setName] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [creating, setCreating] = useState(false)

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['userSearch', searchQuery],
    queryFn: () => userService.searchUsers(searchQuery),
    enabled: searchQuery.length >= 2,
  })

  const toggleUser = (userId: string) => {
    setSelected((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleCreate = async () => {
    if (!name.trim() || selected.length === 0) return
    setCreating(true)
    try {
      const chat = await chatService.createGroupChat(name.trim(), selected)
      setActiveChat(chat.id)
      navigate(`/chat/${chat.id}`)
    } catch {}
    setCreating(false)
  }

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => navigate(-1)}
          className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ←
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Create Group</h1>
      </div>

      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Group name"
          className="w-full input-field"
        />
      </div>

      {selected.length > 0 && (
        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {selected.length} member{selected.length !== 1 ? 's' : ''} selected
          </p>
          <div className="flex flex-wrap gap-1">
            {selected.map((userId) => {
              const user = users.find((u: any) => (u._id || u.id) === userId)
              return (
                <span
                  key={userId}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                >
                  {user?.username || 'User'}
                  <button onClick={() => toggleUser(userId)} className="hover:text-primary-700">
                    ×
                  </button>
                </span>
              )
            })}
          </div>
        </div>
      )}

      <div className="px-4 py-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users to add..."
          className="w-full input-field"
        />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoading && searchQuery.length >= 2 && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        )}
        {users.map((u: any) => {
          const userId = u._id || u.id
          const isSelected = selected.includes(userId)
          return (
            <div
              key={userId}
              onClick={() => toggleUser(userId)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-800 ${
                isSelected ? 'bg-primary/5' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300">
                {(u.username || '?')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {u.username}
                </p>
              </div>
              {isSelected && <span className="text-primary text-sm">✓</span>}
            </div>
          )
        })}
      </div>

      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleCreate}
          disabled={!name.trim() || selected.length === 0 || creating}
          className="w-full btn-primary disabled:opacity-50"
        >
          {creating ? 'Creating...' : 'Create Group'}
        </button>
      </div>
    </div>
  )
}
