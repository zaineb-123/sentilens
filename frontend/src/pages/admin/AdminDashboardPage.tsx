import { Users, Building2, Activity, ShieldCheck } from "lucide-react";
import { KpiCard } from "@/components/domain/KpiCard";
import { useAdminUsers } from "@/features/admin/hooks";
import { useOrganizations, useDepartments } from "@/features/organization/hooks";
import { useSystemHealth } from "@/features/analytics/hooks";
import { Badge } from "@/components/ui/Badge";
export default function AdminDashboardPage() {
  const { data: users } = useAdminUsers();
  const { data: orgs } = useOrganizations();
  const { data: departments } = useDepartments();
  const { data: health } = useSystemHealth();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Users" value={users?.length ?? "—"} icon={Users} tone="primary" />
        <KpiCard label="Organizations" value={orgs?.length ?? "—"} icon={Building2} tone="slate" />
        <KpiCard label="Departments" value={departments?.length ?? "—"} icon={Building2} tone="slate" />
        <KpiCard label="System" value={health?.overall === "up" ? "Operational" : health ? "Degraded" : "—"} icon={Activity} tone={health?.overall === "up" ? "positive" : "warning"} />
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-white/5 p-4 text-sm text-slate-600">
        <ShieldCheck className="h-4 w-4 text-primary-600" />
        SentiLens analyzes feedback content and organization-wide trends only — it never profiles or diagnoses individual employees.
        {health && <Badge tone={health.overall === "up" ? "positive" : "warning"} className="ml-auto">{health.overall}</Badge>}
      </div>
    </div>
  );
}
