import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import type { Emotion } from "@/types";
const COLORS: Record<Emotion, string> = { joy: "#2DD4BF", satisfaction: "#5EEAD4", frustration: "#FB923C", anger: "#F87171", sadness: "#60A5FA", fear: "#A78BFA", surprise: "#C4B5FD", neutral: "#94A3B8" };
export function EmotionBarChart({ percentages }: { percentages: Record<Emotion, number> }) {
  const data = (Object.keys(percentages) as Emotion[]).map((k) => ({ name: k, value: percentages[k] })).sort((a, b) => b.value - a.value);
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={false} />
        <XAxis type="number" unit="%" tick={{ fontSize: 12, fill: "#94A3B8" }} />
        <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12, fill: "#CBD5E1" }} className="capitalize" />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]}>{data.map((d) => <Cell key={d.name} fill={COLORS[d.name as Emotion]} />)}</Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
