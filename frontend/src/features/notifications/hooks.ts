import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "./api";
export function useUnreadCount() { return useQuery({ queryKey: ["notifications", "unread-count"], queryFn: notificationsApi.unreadCount, refetchInterval: 30_000 }); }
export function useNotifications() { return useQuery({ queryKey: ["notifications", "list"], queryFn: () => notificationsApi.list() }); }
export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: notificationsApi.markRead, onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }) });
}
