import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { TrendPoint } from "@/types";
import { ChartTooltip } from "./ChartTooltip";

const SERIES = [
  { key: "positive", name: "Positive", color: "#0D9488" },
  { key: "mixed", name: "Mixed", color: "#8B5CF6" },
  { key: "negative", name: "Negative", color: "#DC2626" },
] as const;

export function SentimentTrendChart({ points }: { points: TrendPoint[] }) {
  const data = points.map((p) => ({ date: new Date(p.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }), positive: p.sentiment.positive, negative: p.sentiment.negative, mixed: p.sentiment.mixed }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          {SERIES.map((s) => (
            <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.45} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0.05} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#94A3B8" }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} unit="%" tickLine={false} axisLine={false} />
        <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#CBD5E1", strokeDasharray: "4 4" }} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        {SERIES.map((s) => (
          <Area key={s.key} type="monotone" dataKey={s.key} stackId="1" stroke={s.color} strokeWidth={2} fill={`url(#grad-${s.key})`} name={s.name} animationDuration={800} />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
