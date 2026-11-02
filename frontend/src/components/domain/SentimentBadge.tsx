import { Badge } from "@/components/ui/Badge";
import { Smile, Meh, Frown, GitMerge } from "lucide-react";
import type { Sentiment } from "@/types";
import { useTranslation } from "react-i18next";
const CONFIG: Record<Sentiment, { tone: "positive" | "slate" | "negative" | "mixed"; Icon: typeof Smile }> = {
  positive: { tone: "positive", Icon: Smile }, neutral: { tone: "slate", Icon: Meh },
  negative: { tone: "negative", Icon: Frown }, mixed: { tone: "mixed", Icon: GitMerge },
};
export function SentimentBadge({ sentiment }: { sentiment: Sentiment }) {
  const { t } = useTranslation();
  const { tone, Icon } = CONFIG[sentiment];
  const label = t(`sentimentLabel.${sentiment}`, { defaultValue: { positive: "Positive", neutral: "Neutral", negative: "Negative", mixed: "Mixed" }[sentiment] });
  return <Badge tone={tone}><Icon className="h-3.5 w-3.5" aria-hidden />{label}</Badge>;
}
