import { useQuery } from "@tanstack/react-query";
import { notificationService } from "@/services/notification";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationService.getNotifications(),
  });
}
