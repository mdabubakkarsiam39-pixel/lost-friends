import type { Message } from '@/store/chatStore'

interface MessageBubbleProps {
  message: Message
  isOwn: boolean
  onReact?: (messageId: string, emoji: string) => void
  onRemoveReaction?: (messageId: string, emoji: string) => void
  onEdit?: (messageId: string) => void
  onReply?: (message: Message) => void
  onDelete?: (messageId: string) => void
  onBlock?: (userId: string) => void
  onReport?: (messageId: string) => void
  allMessages?: Message[]
}

function StatusIcon({ status }: { status: Message['status'] }) {
  if (status === 'sent') return <span className="text-xs text-gray-400">✓</span>
  if (status === 'delivered') return <span className="text-xs text-gray-400">✓✓</span>
  return <span className="text-xs text-primary">✓✓</span>
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥']

export function MessageBubble({ message, isOwn, onReact, onRemoveReaction, onEdit, onReply, onDelete, allMessages }: MessageBubbleProps) {
  const replyToMessage = message.replyTo && allMessages
    ? allMessages.find((m) => m.id === message.replyTo)
    : null

  const renderContent = () => {
    if (message.type === 'image' && message.fileUrl) {
      return (
        <div className="mt-1">
          <img
            src={message.fileUrl}
            alt="Image"
            className="max-w-[200px] rounded-sm"
            loading="lazy"
          />
        </div>
      )
    }
    if (message.type === 'video' && message.fileUrl) {
      return (
        <div className="mt-1">
          <video
            src={message.fileUrl}
            controls
            className="max-w-[200px] rounded-sm"
          />
        </div>
      )
    }
    if (message.type === 'voice' && message.fileUrl) {
      return (
        <div className="mt-1">
          <audio
            src={message.fileUrl}
            controls
            className="w-full max-w-[200px]"
          />
        </div>
      )
    }
    if (message.type === 'file' && message.fileUrl) {
      return (
        <a
          href={message.fileUrl}
          download={message.fileName}
          className="flex items-center gap-2 mt-1 text-sm underline"
        >
          <span>📎</span>
          <span className="truncate max-w-[150px]">{message.fileName || 'File'}</span>
        </a>
      )
    }
    return null
  }

  const reactions = message.reactions || {}
  const reactionEntries = Object.entries(reactions).filter(([, users]) => users.length > 0)

  return (
    <div className={`group flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className="relative max-w-[75%]">
        {message.forwardedFrom && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 italic">Forwarded</p>
        )}
        {replyToMessage && (
          <div className={`mb-1 px-3 py-1.5 rounded-sm text-xs border-l-2 ${
            isOwn
              ? 'bg-primary/10 border-primary text-primary'
              : 'bg-gray-100 dark:bg-gray-800 border-gray-400 dark:border-gray-500 text-gray-500 dark:text-gray-400'
          }`}>
            <p className="font-medium truncate">{replyToMessage.sender?.username || 'User'}</p>
            <p className="truncate opacity-75">{replyToMessage.content}</p>
          </div>
        )}
        <div
          className={`rounded-lg px-4 py-2 ${
            isOwn
              ? 'bg-primary text-white rounded-br-sm'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
          }`}
        >
          {message.type === 'text' && (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          )}
          {renderContent()}
          <div className={`flex items-center justify-end gap-1 mt-1`}>
            {message.edited && (
              <span className="text-xs opacity-50 italic">edited</span>
            )}
            <span className="text-xs opacity-70">{formatTime(message.createdAt)}</span>
            {isOwn && <StatusIcon status={message.status} />}
          </div>
        </div>

        {reactionEntries.length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            {reactionEntries.map(([emoji, users]) => (
              <button
                key={emoji}
                onClick={() => onRemoveReaction?.(message.id, emoji)}
                className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-0.5 text-xs border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <span>{emoji}</span>
                <span className="text-gray-500 dark:text-gray-400">{users.length}</span>
              </button>
            ))}
          </div>
        )}

        <div className={`absolute top-0 ${isOwn ? '-left-20' : '-right-20'} opacity-0 group-hover:opacity-100 transition-opacity flex gap-1`}>
          {QUICK_REACTIONS.slice(0, 3).map((emoji) => (
            <button
              key={emoji}
              onClick={() => onReact?.(message.id, emoji)}
              className="h-7 w-7 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-sm hover:scale-110 transition-transform shadow-sm"
            >
              {emoji}
            </button>
          ))}
          <button
            onClick={() => onReply?.(message)}
            className="h-7 w-7 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs hover:scale-110 transition-transform shadow-sm"
          >
            ↩
          </button>
          {isOwn && (
            <>
              <button
                onClick={() => onEdit?.(message.id)}
                className="h-7 w-7 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs hover:scale-110 transition-transform shadow-sm"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete?.(message.id)}
                className="h-7 w-7 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-xs hover:scale-110 transition-transform shadow-sm"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
