import { Badge } from "@/components/ui/Badge";
import type { AspectStat } from "@/types";
export function TopAspectsList({ aspects }: { aspects: { key: string; mentions: number }[] }) {
  return (
    <ul className="space-y-2">
      {aspects.map((a) => (
        <li key={a.key} className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-50">
          <span className="text-sm capitalize text-slate-700">{a.key.replace(/^emergent:/, "").replace(/_/g, " ")}</span>
          <Badge tone="slate">{a.mentions} mentions</Badge>
        </li>
      ))}
    </ul>
  );
}
export function AspectStatRow({ aspect }: { aspect: AspectStat }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 last:border-0">
      <span className="text-sm capitalize text-slate-700">{aspect.key.replace(/_/g, " ")}</span>
      <div className="flex items-center gap-2"><Badge tone="positive">{aspect.sentiment.positive}%</Badge><Badge tone="negative">{aspect.sentiment.negative}%</Badge><span className="text-xs text-slate-400">{aspect.mentions}×</span></div>
    </div>
  );
}
