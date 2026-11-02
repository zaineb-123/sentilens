import { useTranslation } from "react-i18next";
import { ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/Button";
export default function ServiceUnavailablePage() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg p-6 text-center">
      <ServerCrash className="h-12 w-12 text-warning-500" />
      <h1 className="text-2xl font-semibold text-slate-900">{t("system.serviceUnavailable.title")}</h1>
      <p className="max-w-sm text-sm text-slate-500">{t("system.serviceUnavailable.description")}</p>
      <Button onClick={() => window.location.reload()}>{t("common.retry")}</Button>
    </div>
  );
}
