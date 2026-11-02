import { useState } from "react";
import { AnalyticsFilterBar, type AnalyticsFilterState } from "@/components/domain/AnalyticsFilterBar";
import { PrivacyGate } from "@/components/domain/PrivacyGate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useTrends } from "@/features/analytics/hooks";
import { LoadingSkeleton, ErrorState, EmptyState } from "@/components/domain/States";
import { SentimentTrendChart } from "@/components/charts/SentimentTrendChart";
export default function TrendsPage() {
  const [filters, setFilters] = useState<AnalyticsFilterState>({});
  const { data, isLoading, isError, refetch } = useTrends(filters);
  return (
    <div className="space-y-6">
      <AnalyticsFilterBar value={filters} onChange={setFilters} />
      {isLoading ? <LoadingSkeleton rows={3} /> : isError || !data ? <ErrorState onRetry={() => refetch()} /> : (
        <PrivacyGate privacy={data.privacy}>
          <Card><CardHeader><CardTitle>Sentiment over time</CardTitle></CardHeader><CardContent>{data.points && data.points.length > 0 ? <SentimentTrendChart points={data.points} /> : <EmptyState title="No data in this range" />}</CardContent></Card>
        </PrivacyGate>
      )}
    </div>
  );
}
