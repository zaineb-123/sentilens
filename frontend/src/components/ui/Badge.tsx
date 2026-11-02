import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";
type Tone = "slate" | "positive" | "negative" | "warning" | "mixed" | "primary";
const toneClasses: Record<Tone, string> = {
  slate: "bg-slate-100 text-slate-700", positive: "bg-positive-50 text-positive-600",
  negative: "bg-negative-50 text-negative-600", warning: "bg-warning-50 text-warning-600",
  mixed: "bg-mixed-50 text-mixed-600", primary: "bg-primary-50 text-primary-700",
};
export function Badge({ tone = "slate", className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", toneClasses[tone], className)} {...props} />;
}
