import { UserAvatar } from '@/components/UserAvatar'
import type { Chat } from '@/store/chatStore'
import { useSocketStore } from '@/store/socketStore'

interface ChatListItemProps {
  chat: Chat
  otherUser?: { id: string; username: string; avatar?: string }
  isActive: boolean
  onClick: () => void
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / 86400000)

  if (days === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  if (days === 1) return 'Yesterday'
  if (days < 7) return date.toLocaleDateString([], { weekday: 'short' })
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export function ChatListItem({ chat, otherUser, isActive, onClick }: ChatListItemProps) {
  const onlineUsers = useSocketStore((s) => s.onlineUsers)
  const isOnline = otherUser ? onlineUsers.includes(otherUser.id) : false

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
        isActive
          ? 'bg-primary/10 dark:bg-primary/20'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      <UserAvatar
        username={otherUser?.username || 'Unknown'}
        avatar={otherUser?.avatar}
        isOnline={isOnline}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
            {otherUser?.username || 'Unknown'}
          </h3>
          {chat.lastMessage && (
            <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 ml-2">
              {formatTime(chat.lastMessage.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {chat.lastMessage?.content || 'No messages yet'}
          </p>
          {chat.unreadCount > 0 && (
            <span className="flex-shrink-0 ml-2 bg-primary text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
              {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
