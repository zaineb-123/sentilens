import { useTranslation } from "react-i18next";
import { useSystemHealth } from "@/features/analytics/hooks";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingSkeleton, ErrorState } from "@/components/domain/States";
import { CheckCircle2, XCircle } from "lucide-react";
export default function AdminMonitoringPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useSystemHealth();
  if (isLoading) return <LoadingSkeleton rows={4} />;
  if (isError || !data) return <ErrorState onRetry={() => refetch()} />;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-border bg-white p-4">
        <span className="text-sm font-medium text-slate-700">{t("admin.monitoring.title")}</span>
        <Badge tone={data.overall === "up" ? "positive" : "warning"}>{t(`admin.monitoring.overall.${data.overall}`)}</Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(data.services).map(([name, svc]) => (
          <Card key={name}><CardContent className="flex items-center justify-between">
            <div><p className="text-sm font-medium capitalize text-slate-800">{name}</p><p className="text-xs text-slate-400">{svc.latencyMs}ms</p></div>
            {svc.status === "up" ? <CheckCircle2 className="h-5 w-5 text-positive-600" /> : <XCircle className="h-5 w-5 text-negative-600" />}
          </CardContent></Card>
        ))}
      </div>
      <p className="text-xs text-slate-400">Last checked {new Date(data.checkedAt).toLocaleTimeString()} — refreshes automatically every 15s.</p>
    </div>
  );
}
