import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { Sentiment } from "@/types";
const COLORS: Record<Sentiment, string> = { positive: "#0D9488", neutral: "#64748B", negative: "#DC2626", mixed: "#8B5CF6" };
export function SentimentPieChart({ percentages }: { percentages: Record<Sentiment, number> }) {
  const data = (Object.keys(percentages) as Sentiment[]).map((k) => ({ name: k, value: percentages[k] }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
          {data.map((d) => <Cell key={d.name} fill={COLORS[d.name as Sentiment]} />)}
        </Pie>
        <Tooltip formatter={(v: number) => `${v}%`} /><Legend iconType="circle" />
      </PieChart>
    </ResponsiveContainer>
  );
}
