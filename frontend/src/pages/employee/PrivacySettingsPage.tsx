import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/Card";
import { ShieldCheck, EyeOff, Users2 } from "lucide-react";
export default function EmployeePrivacySettingsPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-lg font-semibold text-slate-900">{t("nav.privacy")}</h1>
      <Card><CardContent className="flex gap-3"><EyeOff className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" /><div><p className="text-sm font-medium text-slate-900">Your identity is never attached to feedback</p><p className="mt-1 text-sm text-slate-500">Feedback you submit is stored without your user ID, IP address, or browser information — HR cannot trace it back to you.</p></div></CardContent></Card>
      <Card><CardContent className="flex gap-3"><Users2 className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" /><div><p className="text-sm font-medium text-slate-900">Department-level results need a minimum group size</p><p className="mt-1 text-sm text-slate-500">HR only sees detailed statistics for a department once enough people have responded — small groups are never singled out.</p></div></CardContent></Card>
      <Card><CardContent className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" /><div><p className="text-sm font-medium text-slate-900">No individual profiling, ever</p><p className="mt-1 text-sm text-slate-500">SentiLens analyzes feedback content and organization-wide trends — it never scores, diagnoses, or profiles an individual employee.</p></div></CardContent></Card>
    </div>
  );
}
