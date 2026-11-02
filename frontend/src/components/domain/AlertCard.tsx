import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AlertTriangle, TrendingUp } from "lucide-react";
import type { Alert } from "@/types";
import { useTranslation } from "react-i18next";
const SEVERITY_TONE = { info: "primary", warning: "warning", critical: "negative" } as const;
export function AlertCard({ alert, onAcknowledge }: { alert: Alert; onAcknowledge?: (id: string) => void }) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning-50 text-warning-600"><AlertTriangle className="h-4.5 w-4.5" /></div>
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Badge tone={SEVERITY_TONE[alert.severity]} className="capitalize">{alert.severity}</Badge>
              <Badge tone="slate" className="capitalize">{alert.aspectKey.replace(/_/g, " ")}</Badge>
            </div>
            <p className="text-sm text-slate-800">
              <span className="inline-flex items-center gap-1 font-medium text-negative-600"><TrendingUp className="h-3.5 w-3.5" /> +{alert.changePct}pp</span>{" "}
              negative mentions of <strong className="capitalize">{alert.aspectKey.replace(/_/g, " ")}</strong> vs. the previous period.
            </p>
            <p className="mt-1 text-xs text-slate-500">{alert.sampleSize} responses analyzed.</p>
          </div>
        </div>
        {alert.status === "new" && onAcknowledge && <Button size="sm" variant="outline" onClick={() => onAcknowledge(alert._id)}>{t("common.confirm")}</Button>}
        {alert.status !== "new" && <Badge tone="slate" className="capitalize">{alert.status}</Badge>}
      </CardContent>
    </Card>
  );
}
