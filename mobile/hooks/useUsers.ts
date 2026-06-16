import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/user";

export function useUsers(searchQuery: string) {
  return useQuery({
    queryKey: ["users", searchQuery],
    queryFn: () => userService.searchUsers(searchQuery),
    enabled: searchQuery.length > 0,
  });
}
