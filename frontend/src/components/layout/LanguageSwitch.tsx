import { Select, SelectItem } from "@/components/ui/Select";
import { useTranslation } from "react-i18next";
import { setLanguage, type SupportedLanguage } from "@/i18n";
import { Globe } from "lucide-react";
const LABELS: Record<SupportedLanguage, string> = { fr: "Français", en: "English", ar: "العربية" };
export function LanguageSwitch() {
  const { i18n } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-slate-400" />
      <Select value={i18n.language} onValueChange={(v) => setLanguage(v as SupportedLanguage)}>
        {(["fr", "en", "ar"] as const).map((lng) => <SelectItem key={lng} value={lng}>{LABELS[lng]}</SelectItem>)}
      </Select>
    </div>
  );
}
