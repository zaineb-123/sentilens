import { Badge } from "@/components/ui/Badge";
import type { Emotion } from "@/types";
const TONE: Record<Emotion, "positive" | "negative" | "warning" | "slate" | "mixed"> = {
  joy: "positive", satisfaction: "positive", frustration: "warning", anger: "negative",
  sadness: "negative", fear: "mixed", surprise: "mixed", neutral: "slate",
};
export function EmotionBadge({ emotion, score }: { emotion: Emotion; score?: number }) {
  return <Badge tone={TONE[emotion]} className="capitalize">{emotion}{typeof score === "number" && <span className="opacity-70">· {Math.round(score * 100)}%</span>}</Badge>;
}
