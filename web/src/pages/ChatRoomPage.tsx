import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'
import { useSocketStore } from '@/store/socketStore'
import { UserAvatar } from '@/components/UserAvatar'
import { MessageBubble } from '@/components/MessageBubble'
import { TypingIndicator } from '@/components/TypingIndicator'
import { useMessages } from '@/hooks/useMessages'
import { useSocket } from '@/hooks/useSocket'
import { api } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import { friendService } from '@/services/friend'
import { chatService } from '@/services/chat'
import type { Message } from '@/store/chatStore'

const EMOJI_LIST = [
  '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃',
  '😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙',
  '🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫',
  '🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬',
  '😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥',
  '😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱',
]

export default function ChatRoomPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [text, setText] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editingMessage, setEditingMessage] = useState<{ id: string; content: string } | null>(null)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [showReport, setShowReport] = useState(false)
  const [reportTarget, setReportTarget] = useState<{ type: 'message' | 'user'; id: string } | null>(null)
  const [reportReason, setReportReason] = useState('')
  const queryClient = useQueryClient()

  useEffect(() => {
    if (id) {
      const saved = localStorage.getItem(`draft-${id}`)
      if (saved) setText(saved)
    }
  }, [id])

  useEffect(() => {
    if (id && text) {
      localStorage.setItem(`draft-${id}`, text)
    } else if (id && !text) {
      localStorage.removeItem(`draft-${id}`)
    }
  }, [id, text])

  const user = useAuthStore((s) => s.user)
  const { chats, messages, setActiveChat } = useChatStore()
  const { onlineUsers, typingUsers } = useSocketStore()
  const socket = useSocketStore((s) => s.socket)

  const chat = chats.find((c) => c.id === id)
  const other = chat?.participants.find((p) => p.id !== user?.id)
  const chatMessages = id ? messages[id] || [] : []
  const typers = id ? typingUsers[id] || [] : []

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = useMessages(id || '')
  useSocket()

  useEffect(() => {
    if (id) setActiveChat(id)
    return () => setActiveChat(null)
  }, [id, setActiveChat])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages.length])

  useEffect(() => {
    if (!id || !socket) return
    socket.emit('join:chat', { chatId: id })
    return () => {
      socket.emit('leave:chat', { chatId: id })
    }
  }, [id, socket])

  useEffect(() => {
    if (!id || !socket || chatMessages.length === 0) return
    const lastMsg = chatMessages[chatMessages.length - 1]
    if (lastMsg && lastMsg.senderId !== user?.id) {
      socket.emit('message:read', { chatId: id, messageId: lastMsg.id })
    }
  }, [chatMessages, id, socket, user?.id])

  const handleScroll = () => {
    const el = containerRef.current
    if (el && el.scrollTop === 0 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }

  const handleSend = () => {
    const content = text.trim()
    if (!content || !id || !socket) return
    if (editingMessage) {
      socket.emit('message:edit', { chatId: id, messageId: editingMessage.id, content })
      setEditingMessage(null)
    } else if (replyingTo) {
      socket.emit('message:reply', { chatId: id, content, replyTo: replyingTo.id })
      setReplyingTo(null)
    } else {
      socket.emit('message:send', { chatId: id, content, type: 'text' })
    }
    setText('')
    localStorage.removeItem(`draft-${id}`)
    socket.emit('typing:update', { chatId: id, isTyping: false })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTyping = () => {
    if (!id || !socket) return
    socket.emit('typing:update', { chatId: id, isTyping: true })
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      socket.emit('typing:update', { chatId: id, isTyping: false })
    }, 2000)
  }

  const typingTimer = useRef<ReturnType<typeof setTimeout>>()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !id || !socket) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('media', file)
      const res = await api.post<{ url: string }>('/upload/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const type = file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'voice' : 'file'
      socket.emit('message:send', { chatId: id, content: file.name, type, mediaUrl: res.url })
    } catch {
      // ignore
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleEmojiSelect = (emoji: string) => {
    setText((prev) => prev + emoji)
    setShowEmoji(false)
    inputRef.current?.focus()
  }

  const handleReact = (messageId: string, emoji: string) => {
    if (!id || !socket) return
    socket.emit('message:reaction', { chatId: id, messageId, emoji })
  }

  const handleRemoveReaction = (messageId: string, emoji: string) => {
    if (!id || !socket) return
    socket.emit('message:unreaction', { chatId: id, messageId, emoji })
  }

  const handleEdit = (messageId: string) => {
    const msg = chatMessages.find((m) => m.id === messageId)
    if (msg) {
      setEditingMessage({ id: messageId, content: msg.content })
      setReplyingTo(null)
      setText(msg.content)
    }
  }

  const handleReply = (message: Message) => {
    setReplyingTo(message)
    setEditingMessage(null)
    inputRef.current?.focus()
  }

  const handleDelete = (messageId: string) => {
    if (!confirm('Delete this message?')) return
    chatService.deleteMessage(messageId).then(() => {
      queryClient.invalidateQueries({ queryKey: ['messages', id] })
    }).catch(() => {})
  }

  const handleBlock = async (userId: string) => {
    try {
      await friendService.blockUser(userId)
    } catch {}
  }

  const handleReport = async () => {
    if (!reportTarget || !reportReason.trim()) return
    try {
      await api.post('/reports', {
        targetId: reportTarget.id,
        targetType: reportTarget.type,
        reason: reportReason.trim(),
      })
      setShowReport(false)
      setReportTarget(null)
      setReportReason('')
    } catch {}
  }

  if (!chat || !other) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Chat not found</p>
          <button onClick={() => navigate('/chat')} className="btn-primary mt-4">
            Back to chats
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <button
          onClick={() => navigate('/chat')}
          className="lg:hidden p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <UserAvatar
          username={other.username}
          avatar={other.avatar}
          isOnline={onlineUsers.includes(other.id)}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
            {other.username}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {onlineUsers.includes(other.id) ? 'Online' : 'Offline'}
          </p>
        </div>
        <button
          onClick={() => navigate(`/chat/${id}/info`)}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="Chat info"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-thin"
      >
        {isFetchingNextPage && (
          <div className="text-center py-2">
            <div className="animate-spin inline-block w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        )}
        {hasNextPage && !isFetchingNextPage && (
          <button
            onClick={() => fetchNextPage()}
            className="w-full text-center text-sm text-primary hover:underline py-2"
          >
            Load older messages
          </button>
        )}
        {chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
            No messages yet. Say hello!
          </div>
        ) : (
          chatMessages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.senderId === user?.id}
              onReact={handleReact}
              onRemoveReaction={handleRemoveReaction}
              onEdit={handleEdit}
              onReply={handleReply}
              onDelete={handleDelete}
              onBlock={handleBlock}
              onReport={(messageId) => {
                setReportTarget({ type: 'message', id: messageId })
                setShowReport(true)
              }}
              allMessages={chatMessages}
            />
          ))
        )}
        <TypingIndicator usernames={typers.map((t) => t.username)} />
        <div ref={messagesEndRef} />
      </div>

      {(editingMessage || replyingTo) && (
        <div className="px-4 py-2 bg-primary/10 border-b border-primary/20 flex items-center justify-between">
          <span className="text-sm text-primary">
            {editingMessage ? 'Editing message' : `Replying to ${other.username}`}
          </span>
          <button
            onClick={() => {
              setEditingMessage(null)
              setReplyingTo(null)
              setText('')
            }}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      )}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,video/*,audio/*"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => { setText(e.target.value); handleTyping() }}
            onKeyDown={handleKeyDown}
            placeholder={replyingTo ? 'Type a reply...' : 'Type a message...'}
            className="flex-1 input-field"
          />
          <div className="relative">
            <button
              onClick={() => setShowEmoji(!showEmoji)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {showEmoji && (
              <div className="absolute bottom-10 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-lg z-10 w-64 h-48 overflow-y-auto">
                <div className="grid grid-cols-8 gap-1">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiSelect(emoji)}
                      className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleSend}
            disabled={!text.trim() || uploading}
            className="p-2 bg-primary text-white rounded-sm hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Report</h3>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Reason for reporting..."
              className="w-full input-field h-24 resize-none mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowReport(false); setReportTarget(null); setReportReason('') }}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason.trim()}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-sm hover:bg-red-600 disabled:opacity-50"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
