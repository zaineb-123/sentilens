import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Info, Languages, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { SentimentBadge } from "@/components/domain/SentimentBadge";
import type { AnalysisResult, Emotion, Sentiment } from "@/types";

const EMOTION_COLOR: Record<Emotion, string> = { joy: "#2DD4BF", satisfaction: "#5EEAD4", frustration: "#FB923C", anger: "#F87171", sadness: "#60A5FA", fear: "#A78BFA", surprise: "#C4B5FD", neutral: "#94A3B8" };
const ASPECT_TONE: Record<Sentiment, "positive" | "negative" | "mixed" | "slate"> = { positive: "positive", negative: "negative", mixed: "mixed", neutral: "slate" };

/** The AI analysis of the employee's OWN message, shown only to the holder of the receipt code. */
export function AnalysisResultPanel({ result }: { result: AnalysisResult }) {
  const { t, i18n } = useTranslation();
  const [shown, setShown] = useState(false);
  useEffect(() => { const id = requestAnimationFrame(() => setShown(true)); return () => cancelAnimationFrame(id); }, []);

  const { sentiment, emotions, aspects } = result;
  const s = sentiment.scores;
  const aspectLabel = (a: AnalysisResult["aspects"][number]) =>
    typeof a.label === "string" ? a.label : a.label?.[i18n.language] ?? a.label?.en ?? a.key.replace(/^emergent:/, "").replace(/_/g, " ");
  const bar = (pct: number, color: string) => (
    <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
      <div className="h-full origin-left rounded-full transition-transform duration-1000 ease-out" style={{ width: `${Math.max(2, pct)}%`, background: color, boxShadow: `0 0 10px ${color}`, transform: shown ? "scaleX(1)" : "scaleX(0)" }} />
    </div>
  );

  return (
    <section className="glass animate-fade-up rounded-3xl p-6 text-start" aria-label={t("employee.feedback.result.title")}>
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-mixed"><Sparkles className="h-4.5 w-4.5 text-white" /></span>
        <h2 className="text-base font-bold text-slate-900">{t("employee.feedback.result.title")}</h2>
        {result.language && <Badge tone="slate" className="ms-auto uppercase"><Languages className="h-3.5 w-3.5" aria-hidden />{result.language}</Badge>}
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">{t("employee.feedback.result.sentiment")}</p>
        <div className="flex flex-wrap items-center gap-2">
          <SentimentBadge sentiment={sentiment.label} />
          {typeof sentiment.confidence === "number" && <span className="text-xs text-slate-400">{Math.round(sentiment.confidence * 100)}% {t("employee.feedback.result.confidence")}</span>}
        </div>
        {s && (
          <div className="mt-3 space-y-2">
            {([["positive", "#2DD4BF"], ["neutral", "#94A3B8"], ["negative", "#F87171"]] as const).map(([k, c]) => (
              <div key={k} className="grid grid-cols-[5.5rem_1fr_2.5rem] items-center gap-3 text-xs">
                <span className="text-slate-600">{t(`sentimentLabel.${k}`, { defaultValue: k })}</span>{bar(Math.round(s[k] * 100), c)}<span className="text-end font-semibold tabular-nums text-slate-800">{Math.round(s[k] * 100)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {emotions.scores.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">{t("employee.feedback.result.emotions")}</p>
          <div className="space-y-2">
            {emotions.scores.slice(0, 4).map((e) => (
              <div key={e.label} className="grid grid-cols-[5.5rem_1fr_2.5rem] items-center gap-3 text-xs">
                <span className={e.label === emotions.primary ? "font-bold text-slate-900" : "text-slate-600"}>{t(`employee.feedback.result.emotion.${e.label}`, { defaultValue: e.label })}</span>
                {bar(Math.round(e.score * 100), EMOTION_COLOR[e.label] ?? "#94A3B8")}<span className="text-end font-semibold tabular-nums text-slate-800">{Math.round(e.score * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">{t("employee.feedback.result.aspects")}</p>
        {aspects.length ? <div className="flex flex-wrap gap-2">{aspects.map((a) => <Badge key={a.key} tone={ASPECT_TONE[a.sentiment]} className="capitalize">{aspectLabel(a)}</Badge>)}</div>
          : <p className="text-sm text-slate-400">{t("employee.feedback.result.noAspects")}</p>}
      </div>

      <p className="mt-6 flex items-start gap-2 border-t border-border pt-4 text-xs text-slate-400"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />{t("employee.feedback.result.disclaimer")}</p>
    </section>
  );
}
