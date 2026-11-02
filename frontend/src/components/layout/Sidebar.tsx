import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import type { NavItem } from "./navConfig";
import { Sparkles } from "lucide-react";
export function Sidebar({ items, mobileOpen, onClose }: { items: NavItem[]; mobileOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onClose} />}
      <aside className={cn("fixed inset-y-0 start-0 z-40 w-64 shrink-0 transform bg-navy-900 text-slate-200 transition-transform lg:static lg:translate-x-0", mobileOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full")}>
        <div className="flex h-16 items-center gap-2 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary"><Sparkles className="h-4.5 w-4.5 text-white" /></div>
          <span className="text-base font-semibold text-white">{t("app.name")}</span>
        </div>
        <nav className="flex flex-col gap-1 px-3 py-2">
          {items.map(({ to, labelKey, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors", isActive ? "bg-primary text-white" : "text-slate-300 hover:bg-white/5 hover:text-white")}>
              <Icon className="h-4.5 w-4.5 shrink-0" /><span className="truncate">{t(labelKey)}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
