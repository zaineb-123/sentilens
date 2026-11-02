import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";
export function KpiCard({ label, value, icon: Icon, tone = "slate", suffix }: { label: string; value: string | number; icon: LucideIcon; tone?: "slate" | "positive" | "negative" | "warning" | "primary"; suffix?: string }) {
  const toneClasses = { slate: "bg-slate-100 text-slate-600", positive: "bg-positive-50 text-positive-600", negative: "bg-negative-50 text-negative-600", warning: "bg-warning-50 text-warning-600", primary: "bg-primary-50 text-primary-600" }[tone];
  return (
    <Card>
      <CardContent className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{value}{suffix && <span className="ml-1 text-base font-normal text-slate-400">{suffix}</span>}</p>
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", toneClasses)}><Icon className="h-5 w-5" /></div>
      </CardContent>
    </Card>
  );
}
