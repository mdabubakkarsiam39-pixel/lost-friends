import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatService } from '@/services/chat'
import { useChatStore } from '@/store/chatStore'
import { useAuthStore } from '@/store/authStore'

export default function ChatInfoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const chats = useChatStore((s) => s.chats)
  const chat = chats.find((c) => c.id === id)

  const [showInvite, setShowInvite] = useState(false)
  const [inviteLink, setInviteLink] = useState('')

  const { data: pinnedMessages = [] } = useQuery({
    queryKey: ['pinnedMessages', id],
    queryFn: () => chatService.getPinnedMessages(id!),
    enabled: !!id,
  })

  const archiveMutation = useMutation({
    mutationFn: () => chatService.archiveChat(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] })
      navigate('/chat')
    },
  })

  const muteMutation = useMutation({
    mutationFn: () => chatService.muteChat(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chats'] }),
  })

  const pinMutation = useMutation({
    mutationFn: () => chatService.pinChat(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['chats'] }),
  })

  const inviteMutation = useMutation({
    mutationFn: () => chatService.generateInviteLink(id!),
    onSuccess: (data) => {
      setInviteLink(data.inviteLink)
      setShowInvite(true)
    },
  })

  const revokeMutation = useMutation({
    mutationFn: () => chatService.revokeInviteLink(id!),
    onSuccess: () => {
      setInviteLink('')
      setShowInvite(false)
    },
  })

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Chat not found</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => navigate(-1)}
          className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ←
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Chat Info</h1>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
            Members ({chat.participants.length})
          </p>
          {chat.participants.map((p) => (
            <div
              key={p.id}
              className={`flex items-center gap-3 py-2 ${
                p.id === user?.id ? 'opacity-60' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">
                {p.username[0].toUpperCase()}
              </div>
              <span className="text-sm text-gray-900 dark:text-white">
                {p.username}
                {p.id === user?.id && (
                  <span className="text-gray-400 dark:text-gray-500 ml-1">(you)</span>
                )}
              </span>
            </div>
          ))}
        </div>

        {pinnedMessages.length > 0 && (
          <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
              Pinned Messages
            </p>
            {pinnedMessages.map((msg: any) => (
              <div
                key={msg._id || msg.id}
                className="py-2 px-3 bg-gray-50 dark:bg-gray-800/50 rounded-sm mb-2"
              >
                <p className="text-sm text-gray-900 dark:text-white truncate">{msg.content}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {new Date(msg.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="px-4 py-4">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
            Actions
          </p>

          <button
            onClick={() => pinMutation.mutate()}
            className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-sm border-b border-gray-100 dark:border-gray-800 transition-colors"
          >
            📌 {chat.isPinned ? 'Unpin Chat' : 'Pin Chat'}
          </button>

          <button
            onClick={() => muteMutation.mutate()}
            className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-sm border-b border-gray-100 dark:border-gray-800 transition-colors"
          >
            🔇 {chat.isMuted ? 'Unmute Chat' : 'Mute Chat'}
          </button>

          <button
            onClick={() => archiveMutation.mutate()}
            className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-sm border-b border-gray-100 dark:border-gray-800 transition-colors"
          >
            📦 Archive Chat
          </button>

          {chat.type === 'group' && (
            <button
              onClick={() => inviteMutation.mutate()}
              className="w-full text-left px-4 py-3 text-sm text-primary hover:bg-primary/5 rounded-sm border-b border-gray-100 dark:border-gray-800 transition-colors"
            >
              🔗 Generate Invite Link
            </button>
          )}

          {showInvite && inviteLink && (
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Invite link:</p>
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="w-full input-field text-xs"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(inviteLink)
                  }}
                  className="px-3 py-1 text-xs bg-primary text-white rounded-sm"
                >
                  Copy
                </button>
                <button
                  onClick={() => revokeMutation.mutate()}
                  className="px-3 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-sm"
                >
                  Revoke
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
