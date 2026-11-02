import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { Emotion } from "@/types";
const COLORS: Record<Emotion, string> = { joy: "#0D9488", satisfaction: "#14B8A6", frustration: "#EA580C", anger: "#DC2626", sadness: "#B91C1C", fear: "#8B5CF6", surprise: "#A78BFA", neutral: "#64748B" };
export function EmotionBarChart({ percentages }: { percentages: Record<Emotion, number> }) {
  const data = (Object.keys(percentages) as Emotion[]).map((k) => ({ name: k, value: percentages[k] })).sort((a, b) => b.value - a.value);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
        <XAxis type="number" unit="%" tick={{ fontSize: 12, fill: "#64748B" }} />
        <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12, fill: "#334155" }} className="capitalize" />
        <Tooltip formatter={(v: number) => `${v}%`} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]}>{data.map((d) => <Cell key={d.name} fill={COLORS[d.name as Emotion]} />)}</Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
