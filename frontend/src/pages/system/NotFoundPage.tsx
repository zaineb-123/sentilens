import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg p-6 text-center">
      <Compass className="h-12 w-12 text-primary-400" />
      <h1 className="text-2xl font-semibold text-slate-900">{t("system.notFound.title")}</h1>
      <p className="max-w-sm text-sm text-slate-500">{t("system.notFound.description")}</p>
      <Link to="/" className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-white hover:bg-primary-700">{t("system.backHome")}</Link>
    </div>
  );
}
