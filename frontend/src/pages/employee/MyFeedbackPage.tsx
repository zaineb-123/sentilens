import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, ChevronDown, Search, Trash2, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/domain/States";
import { AiProcessingIndicator } from "@/components/domain/AiProcessingIndicator";
import { AnalysisResultPanel } from "@/components/domain/AnalysisResultPanel";
import { SentimentBadge } from "@/components/domain/SentimentBadge";
import { useReceiptStatus } from "@/features/feedback/hooks";
import { useReceiptHistory } from "@/features/feedback/receiptStore";
import { isValidCode, normalizeCode, type SavedReceipt } from "@/features/feedback/receiptHelpers";
import { cn } from "@/lib/cn";

const is404 = (e: unknown) => (e as { response?: { status?: number } })?.response?.status === 404;

function StatusChip({ status }: { status?: string }) {
  const { t } = useTranslation();
  if (status === "failed") return <Badge tone="negative">{t("employee.feedback.result.failed")}</Badge>;
  if (status === "done") return <Badge tone="positive">{t("employee.feedback.result.done")}</Badge>;
  return <Badge tone="primary">{t("employee.v2.myfeedback.pending")}</Badge>;
}

function ReceiptCard({ item, autoLoad, onRemove }: { item: SavedReceipt; autoLoad: boolean; onRemove: () => void }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const { data, isError, error, isLoading } = useReceiptStatus(autoLoad || open ? item.code : undefined, { pollWhilePending: true });
  const missing = isError && is404(error);
  const date = new Date(item.savedAt).toLocaleString(i18n.language, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  return (
    <li className="glass rounded-2xl p-4">
      <div className="flex flex-wrap items-center gap-3">
        <code className="rounded-lg bg-white/10 px-2.5 py-1 font-mono text-sm tracking-wider text-slate-900">{item.code}</code>
        {missing ? <Badge tone="warning">{t("employee.v2.myfeedback.missing")}</Badge> : data ? <StatusChip status={data.analysisStatus} /> : null}
        {data?.result && <SentimentBadge sentiment={data.result.sentiment.label} />}
        <span className="ms-auto text-xs text-slate-400">{t("employee.v2.myfeedback.savedOn", { date })}</span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {!missing && (
          <Button size="sm" variant="outline" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />{open ? t("employee.v2.myfeedback.hide") : t("employee.v2.myfeedback.view")}
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={onRemove} aria-label={t("employee.v2.myfeedback.remove")}><Trash2 className="h-4 w-4" /><span className="hidden sm:inline">{t("employee.v2.myfeedback.remove")}</span></Button>
      </div>
      {open && (
        <div className="mt-4">
          {isLoading ? <AiProcessingIndicator /> : isError && !missing ? <p className="text-sm text-negative-600">{t("employee.v2.myfeedback.lookup.error")}</p>
            : data?.result ? <AnalysisResultPanel result={data.result} /> : data && data.analysisStatus !== "done" ? <AiProcessingIndicator /> : null}
        </div>
      )}
    </li>
  );
}

export default function MyFeedbackPage() {
  const { t } = useTranslation();
  const { items, enabled, add, remove, setEnabled } = useReceiptHistory();
  const [input, setInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [lookup, setLookup] = useState<string | undefined>();
  const q = useReceiptStatus(lookup, { pollWhilePending: true });
  const saved = !!lookup && items.some((i) => i.code === lookup);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!isValidCode(input)) { setFormError(t("employee.v2.myfeedback.lookup.invalid")); setLookup(undefined); return; }
    setFormError(null); setLookup(normalizeCode(input));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-gradient inline-block text-2xl font-extrabold tracking-tight">{t("employee.v2.myfeedback.title")}</h1>
        <p className="mt-1 text-sm text-slate-500">{t("employee.v2.myfeedback.subtitle")}</p>
      </div>

      <section className="glass rounded-2xl p-5">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900"><Search className="h-4 w-4 text-primary-600" />{t("employee.v2.myfeedback.lookup.title")}</h2>
        <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("employee.v2.myfeedback.lookup.placeholder")} className="font-mono uppercase tracking-wider" maxLength={20} autoComplete="off" spellCheck={false} aria-label={t("employee.v2.myfeedback.lookup.title")} />
          <Button type="submit" loading={q.isFetching && !!lookup && !q.data}>{t("employee.v2.myfeedback.lookup.button")}</Button>
        </form>
        {formError && <p role="alert" className="mt-2 text-sm text-negative-600">{formError}</p>}
        {lookup && !formError && (
          <div className="mt-4">
            {q.isError ? <p role="alert" className="text-sm text-negative-600">{is404(q.error) ? t("employee.v2.myfeedback.lookup.notFound") : t("employee.v2.myfeedback.lookup.error")}</p>
              : q.data ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3"><code className="rounded-lg bg-white/10 px-2.5 py-1 font-mono text-sm tracking-wider text-slate-900">{lookup}</code><StatusChip status={q.data.analysisStatus} />
                    {saved ? <span className="inline-flex items-center gap-1 text-xs font-medium text-positive-600"><Check className="h-3.5 w-3.5" />{t("employee.v2.myfeedback.lookup.saved")}</span>
                      : enabled ? <Button size="sm" variant="outline" onClick={() => add(lookup)}><Plus className="h-4 w-4" />{t("employee.v2.myfeedback.lookup.save")}</Button>
                      : <span className="text-xs text-slate-400">{t("employee.v2.myfeedback.lookup.disabled")}</span>}
                  </div>
                  {q.data.result ? <AnalysisResultPanel result={q.data.result} /> : q.data.analysisStatus !== "failed" ? <AiProcessingIndicator /> : null}
                </div>
              ) : <AiProcessingIndicator />}
          </div>
        )}
      </section>

      {!enabled && (
        <div role="status" className="flex flex-wrap items-center gap-3 rounded-2xl border border-warning/40 bg-warning-50 px-4 py-3 text-sm text-warning-700">
          <span>{t("employee.v2.myfeedback.disabled")}</span>
          <button type="button" onClick={() => setEnabled(true)} className="font-semibold underline underline-offset-2">{t("employee.v2.myfeedback.enable")}</button>
        </div>
      )}

      {items.length === 0 ? <EmptyState title={t("employee.v2.myfeedback.empty.title")} description={t("employee.v2.myfeedback.empty.desc")} />
        : <ul className="space-y-3">{items.map((it, i) => <ReceiptCard key={it.code} item={it} autoLoad={i < 10} onRemove={() => remove(it.code)} />)}</ul>}

      <p className="flex items-start gap-2 text-xs text-slate-400"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />{t("employee.v2.myfeedback.deviceNote")} <Link to="/app/privacy" className="font-medium text-primary-600 hover:underline">{t("nav.privacy")}</Link></p>
    </div>
  );
}
