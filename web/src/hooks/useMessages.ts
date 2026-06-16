import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useChatStore } from '@/store/chatStore'
import { chatService } from '@/services/chat'
import type { Message } from '@/store/chatStore'

export function useMessages(chatId: string) {
  const { setMessages, addMessages } = useChatStore()

  const query = useInfiniteQuery({
    queryKey: ['messages', chatId],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await chatService.getMessages(chatId, pageParam, 50)
      return res
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.pagination.page >= lastPage.pagination.pages) return undefined
      return pages.length + 1
    },
    initialPageParam: 1,
    enabled: !!chatId,
  })

  useEffect(() => {
    if (query.data) {
      const allMessages: Message[] = query.data.pages
        .flatMap((p) => p.messages)
        .reverse()
      if (query.data.pages.length === 1) {
        setMessages(chatId, allMessages)
      }
    }
  }, [query.data, chatId, setMessages])

  const fetchNextPage = async () => {
    const result = await query.fetchNextPage()
    if (result.data) {
      const lastPage = result.data.pages[result.data.pages.length - 1]
      addMessages(chatId, lastPage.messages)
    }
  }

  return {
    messages: query.data?.pages.flatMap((p) => p.messages).reverse() || [],
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage,
  }
}