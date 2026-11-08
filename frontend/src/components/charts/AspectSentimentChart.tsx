import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChartTooltip } from "./ChartTooltip";
import type { AspectStat } from "@/types";
export function AspectSentimentChart({ aspects }: { aspects: AspectStat[] }) {
  const data = aspects.slice(0, 10).map((a) => ({ name: a.key.replace(/^emergent:/, "").replace(/_/g, " "), mentions: a.mentions, positive: a.sentiment.positive, negative: a.sentiment.negative }));
  return (
    <ResponsiveContainer width="100%" height={Math.max(260, data.length * 36)}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" horizontal={false} />
        <XAxis type="number" unit="%" tick={{ fontSize: 12, fill: "#94A3B8" }} />
        <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: "#CBD5E1" }} className="capitalize" />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} /><Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="positive" stackId="s" fill="#2DD4BF" name="Positive" radius={[0, 0, 0, 0]} />
        <Bar dataKey="negative" stackId="s" fill="#F87171" name="Negative" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
