import { useNotifications } from '@/hooks/useNotifications'
import { notificationService } from '@/services/notification'
import { useQueryClient } from '@tanstack/react-query'

function formatRelative(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const typeIcons: Record<string, string> = {
  friend_request: '👥',
  message: '💬',
  system: '🔔',
}

export default function NotificationsPage() {
  const { notifications, isLoading } = useNotifications()
  const queryClient = useQueryClient()

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id)
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    } catch {}
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    } catch {}
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Notifications</h2>
          {notifications.some((n) => !n.read) && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                className={`card p-4 flex items-start gap-3 ${
                  !notif.read ? 'border-l-4 border-l-primary cursor-pointer' : ''
                }`}
              >
                <span className="text-xl">{typeIcons[notif.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {notif.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {notif.description}
                  </p>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                  {formatRelative(notif.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
