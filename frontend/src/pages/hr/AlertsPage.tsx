import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useAlerts, useAcknowledgeAlert } from "@/features/analytics/hooks";
import { AlertCard } from "@/components/domain/AlertCard";
import { LoadingSkeleton, ErrorState, EmptyState } from "@/components/domain/States";
import { useState } from "react";
export default function AlertsPage() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<string>("new");
  const { data, isLoading, isError, refetch } = useAlerts(status === "all" ? undefined : status);
  const acknowledge = useAcknowledgeAlert();
  return (
    <div className="space-y-4">
      <Tabs value={status} onValueChange={setStatus}><TabsList><TabsTrigger value="new">New</TabsTrigger><TabsTrigger value="acknowledged">Acknowledged</TabsTrigger><TabsTrigger value="all">All</TabsTrigger></TabsList></Tabs>
      {isLoading ? <LoadingSkeleton rows={3} /> : isError ? <ErrorState onRetry={() => refetch()} /> : !data || data.length === 0 ? (
        <EmptyState title={t("common.noResults")} description="No alerts here — detected trends will appear automatically." />
      ) : <div className="space-y-3">{data.map((a) => <AlertCard key={a._id} alert={a} onAcknowledge={(id) => acknowledge.mutate(id)} />)}</div>}
    </div>
  );
}
