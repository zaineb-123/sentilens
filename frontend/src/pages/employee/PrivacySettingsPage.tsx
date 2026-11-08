import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/Card";
import { ShieldCheck, EyeOff, Users2, History, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useReceiptHistory } from "@/features/feedback/receiptStore";
import { cn } from "@/lib/cn";
export default function EmployeePrivacySettingsPage() {
  const { t } = useTranslation();
  const { items, enabled, setEnabled, clear } = useReceiptHistory();
  const [confirm, setConfirm] = useState(false);
  useEffect(() => { if (!confirm) return; const id = setTimeout(() => setConfirm(false), 4000); return () => clearTimeout(id); }, [confirm]);
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-lg font-semibold text-slate-900">{t("nav.privacy")}</h1>
      <Card><CardContent className="flex gap-3"><EyeOff className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" /><div><p className="text-sm font-medium text-slate-900">Your identity is never attached to feedback</p><p className="mt-1 text-sm text-slate-500">Feedback you submit is stored without your user ID, IP address, or browser information — HR cannot trace it back to you.</p></div></CardContent></Card>
      <Card><CardContent className="flex gap-3"><Users2 className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" /><div><p className="text-sm font-medium text-slate-900">Department-level results need a minimum group size</p><p className="mt-1 text-sm text-slate-500">HR only sees detailed statistics for a department once enough people have responded — small groups are never singled out.</p></div></CardContent></Card>
      <Card><CardContent className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" /><div><p className="text-sm font-medium text-slate-900">No individual profiling, ever</p><p className="mt-1 text-sm text-slate-500">SentiLens analyzes feedback content and organization-wide trends — it never scores, diagnoses, or profiles an individual employee.</p></div></CardContent></Card>
      <Card><CardContent>
        <div className="flex gap-3">
          <History className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900">{t("employee.v2.privacy.history.title")}</p>
            <p className="mt-1 text-sm text-slate-500">{t("employee.v2.privacy.history.desc")}</p>
            <p className="mt-1 text-xs text-slate-400">{t("employee.v2.privacy.history.shared")}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3">
          <span id="history-toggle-label" className="text-sm text-slate-800">{t("employee.v2.privacy.history.toggle")}</span>
          <button type="button" role="switch" aria-checked={enabled} aria-labelledby="history-toggle-label" onClick={() => setEnabled(!enabled)}
            className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60", enabled ? "bg-gradient-to-r from-primary to-mixed" : "bg-white/15")}>
            <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", enabled ? "start-[22px]" : "start-0.5")} />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400">{t("employee.v2.privacy.history.count", { count: items.length })}</span>
          <Button size="sm" variant={confirm ? "danger" : "outline"} disabled={items.length === 0} onClick={() => { if (confirm) { clear(); setConfirm(false); } else setConfirm(true); }}>
            <Trash2 className="h-4 w-4" />{confirm ? t("employee.v2.privacy.history.confirm") : t("employee.v2.privacy.history.clear")}
          </Button>
        </div>
      </CardContent></Card>
    </div>
  );
}
