import { cn } from "@/lib/cn";
import { useTranslation } from "react-i18next";

export function LogoMark({ className }: { className?: string }) {
  return (
    <div className={cn("flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-mixed shadow-lg shadow-primary/30", className)}>
      <svg viewBox="0 0 24 24" className="h-[58%] w-[58%]" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="8" stroke="#fff" strokeWidth="2.2" />
        <circle cx="12" cy="12" r="2.8" fill="#fff" />
      </svg>
    </div>
  );
}

export function Logo({ className, size = "h-9 w-9" }: { className?: string; size?: string }) {
  const { t } = useTranslation();
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={size} />
      <span className="text-lg font-bold tracking-tight text-slate-900">{t("app.name")}</span>
    </span>
  );
}
