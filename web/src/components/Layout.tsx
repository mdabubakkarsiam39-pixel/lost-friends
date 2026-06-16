import { useState } from 'react'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'
import { useSocketStore } from '@/store/socketStore'
import { UserAvatar } from '@/components/UserAvatar'
import { SearchBar } from '@/components/SearchBar'
import { ChatListItem } from '@/components/ChatListItem'
import { useChats } from '@/hooks/useChats'
import { useSocket } from '@/hooks/useSocket'
import { chatService } from '@/services/chat'

const navItems = [
  { path: '/chat', label: 'Chats', icon: '💬' },
  { path: '/friends', label: 'Friends', icon: '👥' },
  { path: '/notifications', label: 'Notifications', icon: '🔔' },
  { path: '/profile', label: 'Profile', icon: '👤' },
  { path: '/settings', label: 'Settings', icon: '⚙️' },
]

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { chats, setActiveChat, activeChat, setChats } = useChatStore()
  const { onlineUsers } = useSocketStore()
  const [search, setSearch] = useState('')

  useSocket()
  useChats()

  const filteredChats = chats.filter((c) => {
    if (!search) return true
    const name = c.participants.find((p) => p.id !== user?.id)?.username || ''
    return name.toLowerCase().includes(search.toLowerCase())
  })

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

  const handleChatClick = (chatId: string) => {
    setActiveChat(chatId)
    navigate(`/chat/${chatId}`)
    setSidebarOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const handleToggleArchived = async () => {
    if (!showArchived) {
      try {
        const archived = await chatService.getArchivedChats()
        setChats(archived)
        setShowArchived(true)
      } catch {}
    } else {
      setShowArchived(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <div className={`
        fixed inset-0 z-30 bg-black/50 lg:hidden
        ${sidebarOpen ? 'block' : 'hidden'}
      `} onClick={() => setSidebarOpen(false)} />

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-80 flex flex-col
        bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-800">
          <UserAvatar
            username={user?.username || ''}
            avatar={user?.avatar}
            isOnline={onlineUsers.includes(user?.id || '')}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate text-gray-900 dark:text-gray-100">
              {user?.username || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
          </div>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-shrink-0 text-center py-3 px-3 text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="text-lg block">{item.icon}</span>
            </Link>
          ))}
        </div>

        <div className="px-4 py-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search chats..." />
        </div>

        <div className="px-4 pb-2 flex gap-2">
          <Link
            to="/groups/create"
            className="flex-1 text-center py-2 text-xs font-medium bg-primary/10 text-primary rounded-sm hover:bg-primary/20 transition-colors"
          >
            + New Group
          </Link>
          <button
            onClick={handleToggleArchived}
            className={`flex-1 py-2 text-xs font-medium rounded-sm transition-colors ${
              showArchived
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {showArchived ? '← Back' : 'Archived'}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500 px-4">
              <p className="text-sm">{showArchived ? 'No archived chats' : 'No chats yet'}</p>
            </div>
          ) : (
            filteredChats.map((chat) => {
              const other = chat.participants.find((p) => p.id !== user?.id)
              return (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  otherUser={other}
                  isActive={activeChat === chat.id}
                  onClick={() => handleChatClick(chat.id)}
                />
              )
            })
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-sm"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-primary">Lost Friends</h1>
          <div className="w-10" />
        </div>
        <Outlet />
      </main>
    </div>
  )
}
