import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
export function PrivacyNotice({ minGroupSize, count }: { minGroupSize: number; count?: number }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-slate-50 px-6 py-10 text-center">
      <ShieldCheck className="h-8 w-8 text-primary-600" />
      <p className="text-sm font-semibold text-slate-900">{t("privacyState.suppressed")}</p>
      <p className="max-w-sm text-sm text-slate-500">{t("privacyState.explain", { minGroupSize, responseCount: count ?? "—" })}</p>
    </div>
  );
}
