import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { AspectStat } from "@/types";
export function AspectSentimentChart({ aspects }: { aspects: AspectStat[] }) {
  const data = aspects.slice(0, 10).map((a) => ({ name: a.key.replace(/^emergent:/, "").replace(/_/g, " "), mentions: a.mentions, positive: a.sentiment.positive, negative: a.sentiment.negative }));
  return (
    <ResponsiveContainer width="100%" height={Math.max(260, data.length * 36)}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
        <XAxis type="number" unit="%" tick={{ fontSize: 12, fill: "#64748B" }} />
        <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: "#334155" }} className="capitalize" />
        <Tooltip /><Legend />
        <Bar dataKey="positive" stackId="s" fill="#0D9488" name="Positive" radius={[0, 0, 0, 0]} />
        <Bar dataKey="negative" stackId="s" fill="#DC2626" name="Negative" radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
