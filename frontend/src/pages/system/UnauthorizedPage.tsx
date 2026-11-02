import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
export default function UnauthorizedPage() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg p-6 text-center">
      <ShieldAlert className="h-12 w-12 text-negative-500" />
      <h1 className="text-2xl font-semibold text-slate-900">{t("system.unauthorized.title")}</h1>
      <p className="max-w-sm text-sm text-slate-500">{t("system.unauthorized.description")}</p>
      <Link to="/" className="text-sm font-medium text-primary-600 hover:underline">{t("system.backHome")}</Link>
    </div>
  );
}
