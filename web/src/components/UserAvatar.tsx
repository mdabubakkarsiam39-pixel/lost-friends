interface UserAvatarProps {
  username: string
  avatar?: string | null
  isOnline?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
}

export function UserAvatar({ username, avatar, isOnline, size = 'md' }: UserAvatarProps) {
  const initials = username
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="relative flex-shrink-0">
      {avatar ? (
        <img
          src={avatar}
          alt={username}
          className={`${sizeMap[size]} rounded-full object-cover`}
        />
      ) : (
        <div className={`${sizeMap[size]} rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold`}>
          {initials}
        </div>
      )}
      {isOnline !== undefined && (
        <span
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
            isOnline ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      )}
    </div>
  )
}
