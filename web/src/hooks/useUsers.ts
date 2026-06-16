import { useQuery } from '@tanstack/react-query'
import { userService } from '@/services/user'

export function useUsers(search: string) {
  return useQuery({
    queryKey: ['users', search],
    queryFn: () => userService.searchUsers(search),
    enabled: search.length >= 2,
  })
}
