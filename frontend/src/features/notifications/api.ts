import { api } from "@/lib/apiClient";
import type { NotificationItem } from "@/types";
export const notificationsApi = {
  list: (unreadOnly = false) => api.get<{ notifications: NotificationItem[] }>("/api/notifications", { params: { unread: unreadOnly } }).then((r) => r.data.notifications),
  unreadCount: () => api.get<{ count: number }>("/api/notifications/unread-count").then((r) => r.data.count),
  markRead: (id: string) => api.patch<{ notification: NotificationItem }>(`/api/notifications/${id}/read`).then((r) => r.data.notification),
};
