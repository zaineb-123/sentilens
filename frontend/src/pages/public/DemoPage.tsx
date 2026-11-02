import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, Users, Briefcase, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { Button } from "@/components/ui/Button";
import { apiErrorMessage } from "@/lib/apiClient";

const DEMO_ACCOUNTS = [
  { role: "employee", icon: Users, email: "employee.demo@acme-sentilens.test", password: "Demo!Employee2026", desc: "Submit anonymous feedback, answer surveys." },
  { role: "hr", icon: Briefcase, email: "hr.demo@acme-sentilens.test", password: "Demo!HR2026", desc: "Explore the analytics dashboard, alerts, and survey builder." },
  { role: "admin", icon: ShieldCheck, email: "admin.demo@acme-sentilens.test", password: "Demo!Admin2026", desc: "Manage users, organizations, and system health." },
] as const;

export default function DemoPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDemoLogin = async (email: string, password: string, role: string) => {
    setLoadingRole(role); setError(null);
    try {
  await login({ email, password });
  navigate("/home", { replace: true });
}
    catch (e) { setError(apiErrorMessage(e, "Demo login failed — has the seed script been run? See README.")); }
    finally { setLoadingRole(null); }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <Link to="/" className="mb-8 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"><ArrowLeft className="h-4 w-4" /> {t("app.name")}</Link>
      <div className="mb-8 text-center">
        <Sparkles className="mx-auto mb-3 h-8 w-8 text-primary-600" />
        <h1 className="text-2xl font-semibold text-slate-900">Explore SentiLens</h1>
        <p className="mt-2 text-sm text-slate-500">Pick a role to sign in instantly with a demo account. All data belongs to a fictional organization seeded for demonstration — see the README for credentials.</p>
      </div>
      {error && <p className="mb-4 rounded-lg bg-negative-50 px-4 py-2 text-center text-sm text-negative-700">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-3">
        {DEMO_ACCOUNTS.map(({ role, icon: Icon, email, password, desc }) => (
          <div key={role} className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-white p-6 text-center shadow-card">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600"><Icon className="h-5 w-5" /></div>
            <p className="text-sm font-semibold capitalize text-slate-900">{role}</p>
            <p className="text-xs text-slate-500">{desc}</p>
            <Button size="sm" className="w-full" loading={loadingRole === role} onClick={() => handleDemoLogin(email, password, role)}>Enter as {role}</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
