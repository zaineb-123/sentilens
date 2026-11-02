import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Sparkles, BarChart3, Smile, Tags, ShieldCheck, Bell, Languages, ClipboardCheck, Brain, LineChart, Lightbulb } from "lucide-react";

const FEATURES = [
  { icon: BarChart3, key: "Sentiment analysis" }, { icon: Smile, key: "Emotion detection" },
  { icon: Tags, key: "Aspect analysis" }, { icon: ShieldCheck, key: "Anonymous feedback" },
  { icon: LineChart, key: "Analytics" }, { icon: Bell, key: "Alerts" }, { icon: Languages, key: "Multilingual analysis" },
];
const STEPS = [
  { icon: ClipboardCheck, labelKey: "landing.how.step1" }, { icon: Brain, labelKey: "landing.how.step2" },
  { icon: LineChart, labelKey: "landing.how.step3" }, { icon: Lightbulb, labelKey: "landing.how.step4" },
];

export default function LandingPage() {
  const { t } = useTranslation();
  return (
    <div className="bg-bg">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary"><Sparkles className="h-4.5 w-4.5 text-white" /></div><span className="text-base font-semibold text-slate-900">{t("app.name")}</span></div>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
          <Link to="/how-it-works" className="hover:text-slate-900">{t("landing.how.title")}</Link>
          <Link to="/privacy" className="hover:text-slate-900">{t("nav.privacy")}</Link>
          <Link to="/login" className="hover:text-slate-900">{t("auth.login")}</Link>
          <Link to="/demo" className="rounded-xl bg-primary px-4 py-2 text-white hover:bg-primary-700">{t("landing.cta.demo")}</Link>
        </nav>
      </header>
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-navy-900 sm:text-5xl">{t("landing.hero.title")}</h1>
        <p className="mt-3 text-lg font-medium text-primary-600">{t("landing.hero.subtitle")}</p>
        <p className="mx-auto mt-5 max-w-2xl text-slate-600">{t("landing.hero.description")}</p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/register" className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-700">{t("landing.cta.start")}</Link>
          <Link to="/demo" className="rounded-xl border border-border bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">{t("landing.cta.demo")}</Link>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="mb-8 text-center text-xl font-semibold text-slate-900">{t("landing.how.title")}</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
          {STEPS.map(({ icon: Icon, labelKey }, i) => (
            <div key={labelKey} className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-white p-6 text-center shadow-card">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600"><Icon className="h-5 w-5" /></div>
              <p className="text-sm font-medium text-slate-700">{i + 1}. {t(labelKey)}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h2 className="mb-8 text-center text-xl font-semibold text-slate-900">{t("landing.features.title")}</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {FEATURES.map(({ icon: Icon, key }) => (
            <div key={key} className="flex flex-col items-center gap-2 rounded-xl border border-border bg-white p-5 text-center"><Icon className="h-5 w-5 text-primary-600" /><p className="text-xs font-medium text-slate-600">{key}</p></div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-primary-600" />
        <h2 className="mb-3 text-xl font-semibold text-slate-900">{t("landing.privacy.title")}</h2>
        <p className="text-sm text-slate-600">Feedback is never linked to an identity. Detailed statistics only appear once a group of responses is large enough to protect anonymity — see our <Link to="/privacy" className="text-primary-600 hover:underline">privacy page</Link> for details.</p>
      </section>
      <footer className="border-t border-border py-8 text-center text-xs text-slate-400">{t("app.name")} — {t("app.tagline")}</footer>
    </div>
  );
}
