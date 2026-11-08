import { useTranslation } from "react-i18next";
import { Link, Navigate, useLocation } from "react-router-dom";
import { CheckCircle2, Copy, Clock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useReceiptStatus } from "@/features/feedback/hooks";
import { AiProcessingIndicator } from "@/components/domain/AiProcessingIndicator";
import { Badge } from "@/components/ui/Badge";
import { AnalysisResultPanel } from "@/components/domain/AnalysisResultPanel";
export default function FeedbackSuccessPage() {
  const { t } = useTranslation();
  const location = useLocation() as { state?: { receiptCode?: string } };
  const receiptCode = location.state?.receiptCode;
  const [copied, setCopied] = useState(false);
  const { data: status } = useReceiptStatus(receiptCode, { pollWhilePending: true });
  if (!receiptCode) return <Navigate to="/app/dashboard" replace />;
  const copy = () => { navigator.clipboard.writeText(receiptCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="mx-auto max-w-xl text-center">
      <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-positive-600" />
      <h1 className="mb-1 text-xl font-semibold text-slate-900">{t("employee.feedback.successTitle")}</h1>
      <p className="mb-6 text-sm text-slate-500">{t("employee.feedback.receiptNote")}</p>
      <Card><CardContent>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">{t("employee.feedback.receiptLabel")}</p>
        <div className="mb-3 flex items-center justify-center gap-2">
          <code className="rounded-lg bg-slate-100 px-3 py-2 text-base font-mono tracking-wider text-slate-800">{receiptCode}</code>
          <Button size="sm" variant="outline" onClick={copy}><Copy className="h-3.5 w-3.5" /> {copied ? "✓" : ""}</Button>
        </div>
        {status?.analysisStatus === "done" ? <Badge tone="positive">{t("employee.feedback.result.done")}</Badge> : status?.analysisStatus === "failed" ? <Badge tone="negative">{t("employee.feedback.result.failed")}</Badge> : <AiProcessingIndicator />}
      </CardContent></Card>
      {status?.result && <div className="mt-6"><AnalysisResultPanel result={status.result} /></div>}
      <div className="mt-6 flex items-center justify-center gap-4 text-sm">
        <Link to="/app/dashboard" className="font-medium text-primary-600 hover:underline">{t("nav.dashboard")}</Link>
        <span className="text-slate-300">·</span>
        <Link to="/app/history" className="inline-flex items-center gap-1 font-medium text-primary-600 hover:underline"><Clock className="h-3.5 w-3.5" /> {t("nav.history")}</Link>
      </div>
    </div>
  );
}
