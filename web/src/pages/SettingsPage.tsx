import { useState, useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'
import { api } from '@/lib/api'
import { userService } from '@/services/user'

export default function SettingsPage() {
  const { isDark, toggle } = useThemeStore()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [, setPermissionStatus] = useState<NotificationPermission>('default')
  const [privacy, setPrivacy] = useState({
    readReceipts: true,
    showOnlineStatus: true,
    showLastSeen: true,
    showTypingIndicators: true,
  })

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission)
      setNotificationsEnabled(Notification.permission === 'granted')
    }
    userService.getPrivacySettings().then(setPrivacy).catch(() => {})
  }, [])

  const toggleNotifications = async () => {
    if (!('Notification' in window)) return

    if (notificationsEnabled) {
      setNotificationsEnabled(false)
      return
    }

    const permission = await Notification.requestPermission()
    setPermissionStatus(permission)
    if (permission === 'granted') {
      setNotificationsEnabled(true)
      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
        })
        await api.post('/api/auth/push/register', { subscription })
      } catch {
        setNotificationsEnabled(false)
      }
    } else {
      setNotificationsEnabled(false)
    }
  }

  const updatePrivacy = async (key: keyof typeof privacy, value: boolean) => {
    const updated = { ...privacy, [key]: value }
    setPrivacy(updated)
    try {
      await userService.updatePrivacySettings({ [key]: value })
    } catch {}
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-lg mx-auto p-4 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Settings</h2>

        <div className="card p-4 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Appearance</h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Dark mode</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Toggle dark/light theme</p>
            </div>
            <button
              onClick={toggle}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                isDark ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isDark ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>
        </div>

        <div className="card p-4 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Push notifications</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Receive notifications for new messages</p>
            </div>
            <button
              onClick={toggleNotifications}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                notificationsEnabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  notificationsEnabled ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>
        </div>

        <div className="card p-4 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Privacy</h3>

          {[
            { key: 'readReceipts' as const, label: 'Read receipts', desc: 'Let others see when you read messages' },
            { key: 'showOnlineStatus' as const, label: 'Online status', desc: 'Show when you are online' },
            { key: 'showLastSeen' as const, label: 'Last seen', desc: 'Show when you were last active' },
            { key: 'showTypingIndicators' as const, label: 'Typing indicators', desc: 'Show when you are typing' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
              <button
                onClick={() => updatePrivacy(key, !privacy[key])}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  privacy[key] ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    privacy[key] ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <div className="card p-4 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Account</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your account settings and preferences.
          </p>
          <button
            onClick={async () => {
              if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return
              try {
                await api.delete('/api/auth/delete-account')
                window.location.href = '/'
              } catch {}
            }}
            className="text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            Delete account
          </button>
        </div>
      </div>
    </div>
  )
}
