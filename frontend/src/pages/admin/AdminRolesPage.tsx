import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Info, UserCircle, Briefcase, ShieldCheck } from "lucide-react";
const ROLES = [
  { role: "employee", icon: UserCircle, caps: ["Answer surveys", "Submit anonymous feedback", "View own participation history"] },
  { role: "hr", icon: Briefcase, caps: ["Create/publish/close surveys", "View analytics & alerts", "Import feedback CSV", "Export reports"] },
  { role: "admin", icon: ShieldCheck, caps: ["Manage users, organizations, departments", "Configure privacy threshold", "View audit logs & system health"] },
];
export default function AdminRolesPage() {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-primary-100 bg-primary-50 p-4 text-sm text-primary-800"><Info className="mt-0.5 h-4 w-4 shrink-0" />{t("admin.roles.note")}</div>
      <div className="grid gap-4 sm:grid-cols-3">
        {ROLES.map(({ role, icon: Icon, caps }) => (
          <Card key={role}>
            <CardHeader><div className="flex items-center gap-2"><Icon className="h-4.5 w-4.5 text-primary-600" /><CardTitle className="capitalize">{role}</CardTitle></div></CardHeader>
            <CardContent><ul className="space-y-1.5 text-sm text-slate-600">{caps.map((c) => <li key={c} className="flex items-start gap-1.5"><Badge tone="slate" className="mt-0.5 h-1.5 w-1.5 rounded-full p-0" />{c}</li>)}</ul></CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
