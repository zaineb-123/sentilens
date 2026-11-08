import { useTranslation } from "react-i18next";
import { useNotifications, useMarkNotificationRead } from "@/features/notifications/hooks";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingSkeleton, ErrorState, EmptyState } from "@/components/domain/States";
import { Bell } from "lucide-react";
import { cn } from "@/lib/cn";
export default function NotificationCenterPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  if (isLoading) return <LoadingSkeleton rows={4} />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!data || data.length === 0) return <EmptyState title={t("common.noResults")} />;
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      {data.map((n) => (
        <Card key={n._id} className={cn(!n.read && "border-primary-200 bg-primary/10")} onClick={() => !n.read && markRead.mutate(n._id)}>
          <CardContent className="flex items-start gap-3">
            <Bell className={cn("mt-0.5 h-4 w-4 shrink-0", n.read ? "text-slate-300" : "text-primary-600")} />
            <div className="flex-1">
              <div className="flex items-center gap-2"><p className="text-sm font-medium text-slate-900">{n.title}</p>{!n.read && <Badge tone="primary">New</Badge>}</div>
              {n.message && <p className="mt-0.5 text-sm text-slate-500">{n.message}</p>}
              <p className="mt-1 text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
