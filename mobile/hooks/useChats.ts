import { useQuery } from "@tanstack/react-query";
import { chatService } from "@/services/chat";

export function useChats() {
  return useQuery({
    queryKey: ["chats"],
    queryFn: () => chatService.getChats(),
  });
}
