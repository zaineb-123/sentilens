import { useState } from "react";
import { AnalyticsFilterBar, type AnalyticsFilterState } from "@/components/domain/AnalyticsFilterBar";
import { PrivacyGate } from "@/components/domain/PrivacyGate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useAspectBreakdown } from "@/features/analytics/hooks";
import { LoadingSkeleton, ErrorState, EmptyState } from "@/components/domain/States";
import { AspectSentimentChart } from "@/components/charts/AspectSentimentChart";
import { AspectStatRow } from "@/components/charts/AspectLists";
export default function AspectAnalyticsPage() {
  const [filters, setFilters] = useState<AnalyticsFilterState>({});
  const { data, isLoading, isError, refetch } = useAspectBreakdown(filters);
  return (
    <div className="space-y-6">
      <AnalyticsFilterBar value={filters} onChange={setFilters} />
      {isLoading ? <LoadingSkeleton rows={3} /> : isError || !data ? <ErrorState onRetry={() => refetch()} /> : (
        <PrivacyGate privacy={data.privacy}>
          {data.aspects && data.aspects.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card><CardHeader><CardTitle>Sentiment by aspect</CardTitle></CardHeader><CardContent><AspectSentimentChart aspects={data.aspects} /></CardContent></Card>
              <Card><CardHeader><CardTitle>All aspects</CardTitle></CardHeader><CardContent>{data.aspects.map((a) => <AspectStatRow key={a.key} aspect={a} />)}</CardContent></Card>
            </div>
          ) : <EmptyState title="No aspects detected yet" />}
        </PrivacyGate>
      )}
    </div>
  );
}
