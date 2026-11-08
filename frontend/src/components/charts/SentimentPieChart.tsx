import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { Sentiment } from "@/types";
import { ChartTooltip } from "./ChartTooltip";
const COLORS: Record<Sentiment, string> = { positive: "#0D9488", neutral: "#94A3B8", negative: "#DC2626", mixed: "#8B5CF6" };
export function SentimentPieChart({ percentages }: { percentages: Record<Sentiment, number> }) {
  const data = (Object.keys(percentages) as Sentiment[]).map((k) => ({ name: k, value: percentages[k] }));
  const top = data.reduce((a, b) => (b.value > a.value ? b : a), data[0]);
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={3} cornerRadius={6} stroke="none" animationDuration={800}>
            {data.map((d) => <Cell key={d.name} fill={COLORS[d.name as Sentiment]} />)}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      {top && (
        <div className="pointer-events-none absolute inset-x-0 top-[105px] -translate-y-1/2 text-center">
          <p className="text-2xl font-semibold tabular-nums text-slate-900">{top.value}%</p>
          <p className="text-[11px] font-medium capitalize text-slate-500">{top.name}</p>
        </div>
      )}
    </div>
  );
}
