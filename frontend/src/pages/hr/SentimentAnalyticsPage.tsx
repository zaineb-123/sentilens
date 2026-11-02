import { useState } from "react";
import { AnalyticsFilterBar, type AnalyticsFilterState } from "@/components/domain/AnalyticsFilterBar";
import { PrivacyGate } from "@/components/domain/PrivacyGate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useSentimentBreakdown } from "@/features/analytics/hooks";
import { LoadingSkeleton, ErrorState } from "@/components/domain/States";
import { SentimentPieChart } from "@/components/charts/SentimentPieChart";
import { SentimentBadge } from "@/components/domain/SentimentBadge";
import type { Sentiment } from "@/types";
export default function SentimentAnalyticsPage() {
  const [filters, setFilters] = useState<AnalyticsFilterState>({});
  const { data, isLoading, isError, refetch } = useSentimentBreakdown(filters);
  return (
    <div className="space-y-6">
      <AnalyticsFilterBar value={filters} onChange={setFilters} />
      {isLoading ? <LoadingSkeleton rows={3} /> : isError || !data ? <ErrorState onRetry={() => refetch()} /> : (
        <PrivacyGate privacy={data.privacy}>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2"><CardHeader><CardTitle>Distribution</CardTitle></CardHeader><CardContent><SentimentPieChart percentages={data.percentages!} /></CardContent></Card>
            <Card><CardHeader><CardTitle>Counts</CardTitle></CardHeader>
              <CardContent className="space-y-3">{(Object.keys(data.counts!) as Sentiment[]).map((k) => (<div key={k} className="flex items-center justify-between"><SentimentBadge sentiment={k} /><span className="text-sm font-semibold">{data.counts![k]}</span></div>))}</CardContent>
            </Card>
          </div>
        </PrivacyGate>
      )}
    </div>
  );
}
