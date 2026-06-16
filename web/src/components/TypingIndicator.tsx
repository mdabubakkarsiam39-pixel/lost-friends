import { useEffect, useState } from 'react'

interface TypingIndicatorProps {
  usernames: string[]
}

export function TypingIndicator({ usernames }: TypingIndicatorProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 3000)
    return () => clearTimeout(timer)
  }, [usernames])

  if (!visible || usernames.length === 0) return null

  const text = usernames.length === 1
    ? `${usernames[0]} is typing...`
    : usernames.length === 2
      ? `${usernames[0]} and ${usernames[1]} are typing...`
      : `${usernames[0]} and ${usernames.length - 1} others are typing...`

  return (
    <div className="flex items-center gap-2 px-4 py-1 text-xs text-gray-500 dark:text-gray-400">
      <div className="flex gap-0.5">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span>{text}</span>
    </div>
  )
}
