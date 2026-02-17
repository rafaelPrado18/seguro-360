import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "@/services/notificationsService";

export function useNotificationEvents(userId: string) {
  return useQuery({
    queryKey: ["notifications", "events", userId],
    queryFn: () => notificationsService.getEvents(userId),
    enabled: !!userId && userId !== "guest",
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
    retry: 1,
  });
}

export function useMarkEventAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => notificationsService.markAsRead(eventId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", "events"] }),
  });
}

export function useMarkAllEventsAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => notificationsService.markAllAsRead(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", "events"] }),
  });
}
