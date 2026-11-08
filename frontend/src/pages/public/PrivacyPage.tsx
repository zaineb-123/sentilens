import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, EyeOff, Users2, Lock } from "lucide-react";
const POINTS = [
  { icon: EyeOff, title: "No identity attached", body: "Feedback documents never contain a user ID, IP address, or browser/user-agent string — by database design, not just by policy." },
  { icon: Users2, title: "Group-size threshold (k-anonymity)", body: "Detailed statistics for a department only appear once it has at least the organization's configured minimum number of responses (5 by default)." },
  { icon: Lock, title: "Complementary suppression", body: "If exactly one group is hidden for being too small, the next-smallest visible group is hidden too — so its value can't be worked out by subtracting the others from the total." },
  { icon: ShieldCheck, title: "No psychological profiling", body: "SentiLens analyzes feedback content and aggregated trends. It never diagnoses, scores, or profiles an individual employee." },
];
export default function PrivacyPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link to="/" className="mb-8 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"><ArrowLeft className="h-4 w-4" /> {t("app.name")}</Link>
      <h1 className="mb-3 text-2xl font-semibold text-slate-900">{t("landing.privacy.title")}</h1>
      <p className="mb-8 text-sm text-slate-600">How SentiLens protects employee anonymity, by design.</p>
      <div className="space-y-6">
        {POINTS.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex gap-4 rounded-2xl border border-border bg-white/5 p-5 shadow-card">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600"><Icon className="h-5 w-5" /></div>
            <div><p className="text-sm font-semibold text-slate-900">{title}</p><p className="mt-1 text-sm text-slate-600">{body}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}
