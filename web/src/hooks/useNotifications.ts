import { useQuery } from '@tanstack/react-query'
import { notificationService } from '@/services/notification'

export function useNotifications() {
  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(),
  })

  return {
    notifications: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  }
}