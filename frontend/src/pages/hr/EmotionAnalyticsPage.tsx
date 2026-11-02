import { useState } from "react";
import { AnalyticsFilterBar, type AnalyticsFilterState } from "@/components/domain/AnalyticsFilterBar";
import { PrivacyGate } from "@/components/domain/PrivacyGate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useEmotionBreakdown } from "@/features/analytics/hooks";
import { LoadingSkeleton, ErrorState } from "@/components/domain/States";
import { EmotionBarChart } from "@/components/charts/EmotionBarChart";
export default function EmotionAnalyticsPage() {
  const [filters, setFilters] = useState<AnalyticsFilterState>({});
  const { data, isLoading, isError, refetch } = useEmotionBreakdown(filters);
  return (
    <div className="space-y-6">
      <AnalyticsFilterBar value={filters} onChange={setFilters} />
      {isLoading ? <LoadingSkeleton rows={3} /> : isError || !data ? <ErrorState onRetry={() => refetch()} /> : (
        <PrivacyGate privacy={data.privacy}><Card><CardHeader><CardTitle>Emotion distribution</CardTitle></CardHeader><CardContent><EmotionBarChart percentages={data.percentages!} /></CardContent></Card></PrivacyGate>
      )}
    </div>
  );
}
