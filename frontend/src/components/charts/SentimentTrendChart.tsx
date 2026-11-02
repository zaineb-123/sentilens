import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { TrendPoint } from "@/types";
export function SentimentTrendChart({ points }: { points: TrendPoint[] }) {
  const data = points.map((p) => ({ date: new Date(p.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }), positive: p.sentiment.positive, negative: p.sentiment.negative, mixed: p.sentiment.mixed }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#64748B" }} />
        <YAxis tick={{ fontSize: 12, fill: "#64748B" }} unit="%" />
        <Tooltip /><Legend />
        <Area type="monotone" dataKey="positive" stackId="1" stroke="#0D9488" fill="#CCFBF1" name="Positive" />
        <Area type="monotone" dataKey="mixed" stackId="1" stroke="#8B5CF6" fill="#EDE9FE" name="Mixed" />
        <Area type="monotone" dataKey="negative" stackId="1" stroke="#DC2626" fill="#FEE2E2" name="Negative" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
