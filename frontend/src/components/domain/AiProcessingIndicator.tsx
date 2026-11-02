import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
export function AiProcessingIndicator() {
  const { t } = useTranslation();
  return <div className="flex items-center gap-2 text-sm text-primary-700"><Sparkles className="h-4 w-4 animate-pulse" />{t("system.aiProcessing")}</div>;
}
