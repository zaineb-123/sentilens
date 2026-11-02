import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Upload } from "lucide-react";
import { AnalyticsFilterBar, type AnalyticsFilterState } from "@/components/domain/AnalyticsFilterBar";
import { useFeedbackExplorer, useImportCsv } from "@/features/feedback/hooks";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSkeleton, ErrorState, EmptyState } from "@/components/domain/States";
import { PrivacyNotice } from "@/components/domain/PrivacyNotice";
import { useToast } from "@/components/ui/Toast";
import { apiErrorMessage } from "@/lib/apiClient";
export default function FeedbackExplorerPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<AnalyticsFilterState>({});
  const { data, isLoading, isError, refetch } = useFeedbackExplorer(filters);
  const importCsv = useImportCsv();
  const { push } = useToast();
  const handleUpload = (file: File | undefined) => {
    if (!file) return;
    importCsv.mutate(file, {
      onSuccess: (batch) => push({ tone: "success", title: "Import complete", description: `${batch.valid} valid, ${batch.invalid} invalid of ${batch.total} rows.` }),
      onError: (e) => push({ tone: "error", title: "Import failed", description: apiErrorMessage(e) }),
    });
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <AnalyticsFilterBar value={filters} onChange={setFilters} />
        <label>
          <input type="file" accept=".csv" className="hidden" onChange={(e) => handleUpload(e.target.files?.[0])} />
          <Button variant="outline" size="sm" loading={importCsv.isPending} onClick={(e) => { (e.currentTarget.previousSibling as HTMLElement)?.click(); }}><Upload className="h-4 w-4" /> Import CSV</Button>
        </label>
      </div>
      {isLoading ? <LoadingSkeleton rows={5} /> : isError || !data ? <ErrorState onRetry={() => refetch()} /> : data.suppressed ? (
        <PrivacyNotice minGroupSize={data.minGroupSize!} count={data.count} />
      ) : data.items.length === 0 ? <EmptyState title={t("common.noResults")} /> : (
        <div className="space-y-3">
          {data.items.map((item, i) => (
            <Card key={i}><CardContent className="flex items-start justify-between gap-4">
              <p className="text-sm text-slate-700">{item.comment || <span className="italic text-slate-400">No comment (survey answers only)</span>}</p>
              <span className="shrink-0 text-xs text-slate-400">{new Date(item.day).toLocaleDateString()}</span>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
}
