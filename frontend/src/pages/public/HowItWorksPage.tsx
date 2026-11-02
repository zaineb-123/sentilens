import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft, UserCheck, Brain, LineChart, Megaphone } from "lucide-react";
const STEPS = [
  { icon: UserCheck, title: "Employees submit feedback", body: "Through a survey or the anonymous box — no identity, IP, or browser info is ever stored." },
  { icon: Brain, title: "AI analyzes the content", body: "Sentiment (incl. Mixed), emotions, and which workplace aspects are being discussed — in French, English, or Arabic." },
  { icon: LineChart, title: "Trends are aggregated", body: "Results roll up into dashboards, but only once a group is large enough to protect anonymity." },
  { icon: Megaphone, title: "HR acts on real signals", body: "Alerts flag significant shifts — described as detected trends, never as a claimed cause." },
];
export default function HowItWorksPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link to="/" className="mb-8 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"><ArrowLeft className="h-4 w-4" /> {t("app.name")}</Link>
      <h1 className="mb-8 text-2xl font-semibold text-slate-900">{t("landing.how.title")}</h1>
      <div className="space-y-6">
        {STEPS.map(({ icon: Icon, title, body }, i) => (
          <div key={title} className="flex gap-4 rounded-2xl border border-border bg-white p-5 shadow-card">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600"><Icon className="h-5 w-5" /></div>
            <div><p className="text-sm font-semibold text-slate-900">{i + 1}. {title}</p><p className="mt-1 text-sm text-slate-600">{body}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}
