import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { useCountUp } from "@/lib/useCountUp";
import { Sparkline } from "./Sparkline";
import type { LucideIcon } from "lucide-react";

type Tone = "slate" | "positive" | "negative" | "warning" | "primary";

const HEX: Record<Tone, string> = { slate: "#94A3B8", positive: "#2DD4BF", negative: "#F87171", warning: "#FB923C", primary: "#818CF8" };
const TONES: Record<Tone, { icon: string; bar: string }> = {
  slate: { icon: "bg-slate-100 text-slate-600", bar: "from-slate-300 to-slate-100" },
  positive: { icon: "bg-positive-50 text-positive-600", bar: "from-positive-600 to-positive-100" },
  negative: { icon: "bg-negative-50 text-negative-600", bar: "from-negative-600 to-negative-100" },
  warning: { icon: "bg-warning-50 text-warning-600", bar: "from-warning-600 to-warning-100" },
  primary: { icon: "bg-primary-50 text-primary-600", bar: "from-primary-600 to-primary-100" },
};

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: Tone;
  suffix?: string;
  /** Percentage-point change vs previous period. Omit to hide. */
  delta?: number;
  /** Optional real series rendered as a glowing sparkline. */
  spark?: number[];
  /** When true, a rising delta is shown as bad (e.g. alerts). */
  invertDelta?: boolean;
}

function AnimatedValue({ value }: { value: number }) {
  const v = useCountUp(value);
  const decimals = Number.isInteger(value) ? 0 : 1;
  return <>{v.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}</>;
}

export function KpiCard({ label, value, icon: Icon, tone = "slate", suffix, delta, invertDelta, spark }: KpiCardProps) {
  const t = TONES[tone];
  const good = delta === undefined || delta === 0 ? null : (delta > 0) !== !!invertDelta;
  const DeltaIcon = delta === undefined || delta === 0 ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", t.bar)} />
      {spark && <Sparkline data={spark} color={HEX[tone]} className="pointer-events-none absolute bottom-3 end-4 opacity-90" />}
      <CardContent className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
            {typeof value === "number" ? <AnimatedValue value={value} /> : value}
            {suffix && <span className="ms-1 text-base font-normal text-slate-400">{suffix}</span>}
          </p>
          {delta !== undefined && (
            <p className={cn("mt-1 inline-flex items-center gap-1 text-xs font-medium", good === null ? "text-slate-400" : good ? "text-positive-600" : "text-negative-600")}>
              <DeltaIcon className="h-3 w-3" aria-hidden />
              {delta > 0 ? "+" : ""}{delta.toFixed(1)} pts
            </p>
          )}
        </div>
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110", t.icon)}><Icon className="h-5 w-5" /></div>
      </CardContent>
    </Card>
  );
}
