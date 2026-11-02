import { useState } from "react";
import { Download } from "lucide-react";
import { AnalyticsFilterBar, type AnalyticsFilterState } from "@/components/domain/AnalyticsFilterBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { analyticsApi } from "@/features/analytics/api";
import { useToast } from "@/components/ui/Toast";
import { apiErrorMessage } from "@/lib/apiClient";
export default function ReportsPage() {
  const [filters, setFilters] = useState<AnalyticsFilterState>({});
  const [downloading, setDownloading] = useState(false);
  const { push } = useToast();
  const download = async () => {
    setDownloading(true);
    try {
      const blob = await analyticsApi.exportCsv(filters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = "sentilens-report.csv"; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { push({ tone: "error", title: "Export failed", description: apiErrorMessage(e) }); }
    finally { setDownloading(false); }
  };
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <AnalyticsFilterBar value={filters} onChange={setFilters} />
      <Card>
        <CardHeader><CardTitle>Export aggregated report</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-500">Downloads a CSV with the current overview totals and per-aspect sentiment breakdown for the selected filters. Respects the same anonymity threshold as every dashboard — if a department is too small, the export will not contain its data either.</p>
          <p className="text-xs text-slate-400">PDF export is not implemented yet — CSV only.</p>
          <Button onClick={download} loading={downloading}><Download className="h-4 w-4" /> Export CSV</Button>
        </CardContent>
      </Card>
    </div>
  );
}
