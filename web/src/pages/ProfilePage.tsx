import { useState, useRef } from 'react'
import { useAuthStore } from '@/store/authStore'
import { UserAvatar } from '@/components/UserAvatar'
import { userService } from '@/services/user'

export default function ProfilePage() {
  const { user, setUser } = useAuthStore()
  const [username, setUsername] = useState(user?.username || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const updated = await userService.updateProfile({ username, bio })
      setUser(updated)
      setMessage('Profile updated')
    } catch {
      setMessage('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('avatar', file)
    setSaving(true)
    setMessage('')
    try {
      const updated = await userService.uploadAvatar(formData)
      setUser(updated)
      setMessage('Avatar updated')
    } catch {
      setMessage('Failed to upload avatar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-lg mx-auto p-4 space-y-6">
        <div className="flex flex-col items-center py-6">
          <UserAvatar
            username={user?.username || ''}
            avatar={user?.avatar}
            size="lg"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 text-sm text-primary hover:underline"
          >
            Change photo
          </button>
        </div>

        <div className="card p-4 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Profile</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="input-field resize-none"
              rows={3}
              placeholder="Tell us about yourself..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="input-field opacity-60 cursor-not-allowed"
            />
          </div>

          {message && (
            <p className={`text-sm ${message === 'Profile updated' || message === 'Avatar updated' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {message}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary w-full disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
