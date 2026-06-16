import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useChatStore } from '@/store/chatStore'
import { chatService } from '@/services/chat'

export function useChats() {
  const setChats = useChatStore((s) => s.setChats)

  const query = useQuery({
    queryKey: ['chats'],
    queryFn: () => chatService.getChats(),
  })

  useEffect(() => {
    if (query.data) {
      setChats(query.data)
    }
  }, [query.data, setChats])

  return query
}
