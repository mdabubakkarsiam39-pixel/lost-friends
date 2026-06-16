import { useInfiniteQuery } from "@tanstack/react-query";
import { chatService } from "@/services/chat";

export function useMessages(chatId: string) {
  return useInfiniteQuery({
    queryKey: ["messages", chatId],
    queryFn: ({ pageParam = undefined }) =>
      chatService.getMessages(chatId, pageParam as string | undefined),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!chatId,
  });
}
