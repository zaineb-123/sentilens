import { useRef, type ReactNode, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Smile, HeartPulse, Layers, EyeOff, BarChart3, Bell, Languages, ShieldCheck, Zap, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { Reveal, CountUp } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

const FEATURES = [
  { k: "sentiment", icon: Smile, c: "from-positive to-primary" }, { k: "emotions", icon: HeartPulse, c: "from-mixed to-pink-500" },
  { k: "aspects", icon: Layers, c: "from-primary to-mixed" }, { k: "anonymous", icon: EyeOff, c: "from-positive to-emerald-400" },
  { k: "analytics", icon: BarChart3, c: "from-primary to-positive" }, { k: "alerts", icon: Bell, c: "from-warning to-negative" },
  { k: "multilingual", icon: Languages, c: "from-mixed to-primary" },
] as const;

/** Wrapper that follows the pointer (parallax by `depth` px) around an inner floating card. */
function Floaty({ depth, delay, className, children }: { depth: number; delay: number; className: string; children: ReactNode }) {
  return (
    <div className={cn("absolute transition-transform duration-200 ease-out", className)} style={{ transform: `translate3d(calc(var(--mx,0) * ${depth}px), calc(var(--my,0) * ${depth}px), 0)` }}>
      <div className="glass animate-float rounded-2xl" style={{ animationDelay: `${delay}s` }}>{children}</div>
    </div>
  );
}

const RING = [{ len: 56.5, start: 0, color: "#2DD4BF" }, { len: 22.5, start: 58, color: "#A78BFA" }, { len: 16.5, start: 82, color: "#F87171" }];

function SentimentRing() {
  return (
    <svg viewBox="0 0 160 160" className="h-40 w-40 -rotate-90" aria-hidden>
      <circle cx="80" cy="80" r="62" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="14" />
      {RING.map((s) => (
        <circle key={s.color} cx="80" cy="80" r="62" pathLength={100} fill="none" stroke={s.color} strokeWidth="14" strokeLinecap="round" className="ring-seg"
          strokeDashoffset={-s.start} style={{ ["--len" as string]: s.len, filter: `drop-shadow(0 0 6px ${s.color})` }} />
      ))}
    </svg>
  );
}

export default function LandingPage() {
  const { t } = useTranslation();
  const hero = useRef<HTMLElement>(null);
  const onMove = (e: MouseEvent) => {
    const el = hero.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    el.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };
  const steps = [t("landing.how.step1"), t("landing.how.step2"), t("landing.how.step3"), t("landing.how.step4")];

  return (
    <div className="min-h-screen overflow-x-hidden">
      <header className="sticky top-0 z-30 border-b border-border bg-ink/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <Logo />
          <nav className="flex items-center gap-5 text-sm font-medium text-slate-500">
            <Link to="/how-it-works" className="hidden transition hover:text-slate-900 md:inline">{t("landing.how.title")}</Link>
            <Link to="/privacy" className="hidden transition hover:text-slate-900 md:inline">{t("landing.privacy.title")}</Link>
            <LanguageSwitch />
            <Link to="/login" className="transition hover:text-slate-900">{t("landing.v2.login")}</Link>
            <Link to="/register" className="btn-glow rounded-full bg-gradient-to-br from-primary to-mixed px-5 py-2 text-white transition hover:brightness-110">{t("landing.v2.register")}</Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section ref={hero} onMouseMove={onMove} className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 pb-20 pt-16 lg:grid-cols-2 lg:pt-24">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/5 px-4 py-1.5 text-sm text-slate-700 backdrop-blur">
            <span className="relative flex h-2 w-2"><span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-positive" /><span className="relative inline-flex h-2 w-2 rounded-full bg-positive" /></span>
            {t("landing.v2.badge")}
          </span>
          <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl">
            SentiLens<br /><span className="text-gradient">{t("app.tagline")}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-500">{t("landing.hero.description")}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/register" className="btn-glow group inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-primary to-mixed px-7 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110">
              {t("landing.cta.start")}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            </Link>
            <Link to="/login" className="rounded-full border border-border bg-white/5 px-7 py-3.5 font-semibold text-slate-800 backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/10">{t("landing.v2.login")}</Link>
          </div>
          <dl className="mt-12 flex gap-10">
            {[{ n: 3, l: "statLanguages" }, { n: 8, l: "statEmotions" }, { n: 0, l: "statIds" }].map((s) => (
              <div key={s.l}><dt className="text-4xl font-extrabold text-slate-900"><CountUp to={s.n} /></dt><dd className="mt-1 text-sm text-slate-400">{t(`landing.v2.${s.l}`)}</dd></div>
            ))}
          </dl>
        </div>

        {/* floating glass composition */}
        <div className="relative mx-auto h-[500px] w-full max-w-[560px]" aria-hidden>
          <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 blur-3xl" />
          <Floaty depth={10} delay={0} className="inset-x-4 top-16 sm:inset-x-10">
            <div className="p-6">
              <div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-700">{t("landing.v2.cardSentiment")}</p><span className="rounded-full border border-positive/50 bg-positive/15 px-2.5 py-0.5 text-xs font-semibold text-positive">{t("landing.v2.cardWeek")}</span></div>
              <div className="mt-4 flex items-center gap-6">
                <div className="relative"><SentimentRing /><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-extrabold text-slate-900"><CountUp to={58} suffix="%" /></span><span className="text-xs text-slate-500">{t("landing.v2.positive").toLowerCase()}</span></div></div>
                <ul className="flex-1 space-y-3 text-sm">
                  {[["#2DD4BF", "positive", "58%"], ["#A78BFA", "mixed", "24%"], ["#F87171", "negative", "18%"]].map(([c, k, v]) => (
                    <li key={k} className="flex items-center justify-between"><span className="flex items-center gap-2 text-slate-700"><span className="h-2.5 w-2.5 rounded-full" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />{t(`landing.v2.${k}`)}</span><span className="font-bold text-slate-900">{v}</span></li>
                  ))}
                </ul>
              </div>
              <p className="mt-4 border-t border-border pt-3 text-xs text-slate-400">{t("landing.v2.illustration")}</p>
            </div>
          </Floaty>
          <Floaty depth={22} delay={0.6} className="start-0 top-0 hidden sm:block"><div className="px-5 py-4"><p className="text-xs text-slate-400">{t("landing.v2.langDetected")}</p><p className="text-gradient mt-1 text-xl font-extrabold">FR · EN · AR</p></div></Floaty>
          <Floaty depth={26} delay={1.2} className="end-0 top-2 hidden sm:block"><div className="flex items-center gap-3 px-4 py-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-positive/20"><CheckCircle2 className="h-5 w-5 text-positive" /></span><div><p className="text-sm font-bold text-slate-900">{t("landing.v2.trust")}</p><p className="text-xs text-slate-400">{t("landing.v2.dominant")}</p></div></div></Floaty>
          <Floaty depth={20} delay={1.8} className="bottom-2 start-2 hidden sm:block"><div className="flex items-center gap-3 px-4 py-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-mixed"><Zap className="h-5 w-5 text-white" /></span><div><p className="text-sm font-bold text-slate-900">{t("landing.v2.realtime")}</p><p className="text-xs text-slate-400">{t("landing.v2.realtimeSub")}</p></div></div></Floaty>
          <Floaty depth={28} delay={2.4} className="bottom-0 end-0 hidden sm:block"><div className="px-5 py-4"><p className="flex items-center gap-2 text-xs font-semibold text-negative"><span className="h-1.5 w-1.5 rounded-full bg-negative" style={{ boxShadow: "0 0 8px #F87171" }} />{t("landing.v2.alert")}</p><p className="mt-1 text-sm font-bold text-slate-900">{t("landing.v2.workload")}</p><p className="text-xs text-slate-400">{t("landing.v2.sentimentDown")}</p></div></Floaty>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal><h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{t("landing.how.title")}</h2></Reveal>
        <div className="relative mt-14 grid gap-6 md:grid-cols-4">
          <div className="pointer-events-none absolute inset-x-[12%] top-7 hidden h-px md:block"><Reveal><div className="draw-line h-px w-full bg-gradient-to-r from-primary via-mixed to-positive" /></Reveal></div>
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 120} className="relative text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-mixed text-xl font-extrabold text-white shadow-lg shadow-primary/30">{i + 1}</div>
              <p className="mt-4 font-semibold text-slate-900">{s}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal><h2 className="text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{t("landing.features.title")}</h2></Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ k, icon: Icon, c }, i) => (
            <Reveal key={k} delay={(i % 4) * 90}>
              <div className="glass group h-full rounded-2xl p-6 transition duration-300 hover:-translate-y-1.5 hover:border-primary-400/50 hover:shadow-glow">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3", c)}><Icon className="h-6 w-6 text-white" /></div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">{t(`landing.v2.f.${k}`)}</h3>
                <p className="mt-1 text-sm text-slate-500">{t(`landing.v2.f.${k}.d`)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PRIVACY */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <Reveal>
          <div className="glass relative flex flex-col items-center gap-8 overflow-hidden rounded-3xl p-10 text-center md:flex-row md:text-start">
            <div className="absolute -end-10 -top-10 h-56 w-56 rounded-full bg-positive/20 blur-3xl" />
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
              <span className="animate-pulse-ring absolute h-full w-full rounded-full border-2 border-positive/60" />
              <span className="animate-pulse-ring absolute h-full w-full rounded-full border-2 border-positive/40" style={{ animationDelay: "1.3s" }} />
              <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-positive/15"><ShieldCheck className="h-10 w-10 text-positive" /></span>
            </div>
            <div className="relative">
              <h2 className="text-2xl font-extrabold text-slate-900">{t("landing.privacy.title")}</h2>
              <p className="mt-2 max-w-2xl text-slate-500">{t("landing.v2.privacyBody")}</p>
              <Link to="/privacy" className="mt-4 inline-flex items-center gap-1.5 font-semibold text-primary-600 transition hover:text-primary-700">{t("landing.v2.privacyLink")}<ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FINAL CTA */}
      <section className="mx-auto max-w-4xl px-6 pb-24 pt-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/40 via-mixed/30 to-positive/30 p-12 text-center backdrop-blur">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{t("landing.v2.ctaTitle")}</h2>
            <p className="mt-3 text-slate-600">{t("landing.v2.ctaSub")}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-ink transition hover:-translate-y-0.5 hover:shadow-2xl">{t("landing.v2.register")}<ArrowRight className="h-4 w-4 rtl:rotate-180" /></Link>
              <Link to="/login" className="rounded-full border border-white/30 px-7 py-3.5 font-semibold text-slate-900 transition hover:bg-white/10">{t("landing.v2.login")}</Link>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-slate-400">© {new Date().getFullYear()} SentiLens · {t("app.tagline")}</footer>
    </div>
  );
}
