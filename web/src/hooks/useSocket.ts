import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'
import { useSocketStore } from '@/store/socketStore'
import { getSocket } from '@/lib/socket'

export function useSocket() {
  const token = useAuthStore((s) => s.token)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { setSocket, setConnected, addOnlineUser, removeOnlineUser, setOnlineUsers, addTypingUser, removeTypingUser } = useSocketStore()
  const { addMessage, updateMessageStatus, incrementUnread } = useChatStore()

  useEffect(() => {
    if (!isAuthenticated || !token) return

    const socket = getSocket()

    socket.auth = { token }
    socket.connect()

    socket.on('connect', () => {
      setConnected(true)
      setSocket(socket)
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    socket.on('users:online', (users: string[]) => {
      setOnlineUsers(users)
    })

    socket.on('user:online', (userId: string) => {
      addOnlineUser(userId)
    })

    socket.on('user:offline', (userId: string) => {
      removeOnlineUser(userId)
    })

    socket.on('message:new', (message) => {
      addMessage(message.chatId, message)
      incrementUnread(message.chatId)
    })

    socket.on('message:delivered', ({ chatId, messageId }) => {
      updateMessageStatus(chatId, messageId, 'delivered')
    })

    socket.on('message:read', ({ chatId, messageId }) => {
      updateMessageStatus(chatId, messageId, 'read')
    })

    socket.on('message:edited', ({ chatId, messageId, content, editedAt }) => {
      const messages = useChatStore.getState().messages[chatId] || []
      const updated = messages.map((m) =>
        m.id === messageId ? { ...m, content, edited: true, editedAt } : m
      )
      useChatStore.setState({
        messages: { ...useChatStore.getState().messages, [chatId]: updated },
      })
    })

    socket.on('message:reaction', ({ chatId, messageId, reactions }) => {
      const messages = useChatStore.getState().messages[chatId] || []
      const updated = messages.map((m) =>
        m.id === messageId ? { ...m, reactions } : m
      )
      useChatStore.setState({
        messages: { ...useChatStore.getState().messages, [chatId]: updated },
      })
    })

    socket.on('message:pinned', ({ chatId, messageId }) => {
      const messages = useChatStore.getState().messages[chatId] || []
      const updated = messages.map((m) =>
        m.id === messageId ? { ...m, isPinned: true } : m
      )
      useChatStore.setState({
        messages: { ...useChatStore.getState().messages, [chatId]: updated },
      })
    })

    socket.on('message:unpinned', ({ chatId, messageId }) => {
      const messages = useChatStore.getState().messages[chatId] || []
      const updated = messages.map((m) =>
        m.id === messageId ? { ...m, isPinned: false } : m
      )
      useChatStore.setState({
        messages: { ...useChatStore.getState().messages, [chatId]: updated },
      })
    })

    socket.on('typing:update', ({ chatId, userId, username, isTyping }) => {
      if (isTyping) {
        addTypingUser(chatId, { userId, username })
      } else {
        removeTypingUser(chatId, userId)
      }
    })

    return () => {
      socket.removeAllListeners()
      socket.disconnect()
    }
  }, [isAuthenticated, token])
}
