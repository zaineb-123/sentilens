import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/cn";
import type { NavItem } from "./navConfig";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";
import { Logo } from "@/components/brand/Logo";

export function Sidebar({ items, mobileOpen, onClose }: { items: NavItem[]; mobileOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} />}
      <aside className={cn(
        "glass-strong fixed inset-y-3 start-3 z-40 flex w-64 shrink-0 transform flex-col rounded-3xl transition-transform duration-300",
        "lg:sticky lg:top-3 lg:m-3 lg:me-0 lg:h-[calc(100vh-1.5rem)] lg:self-start lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-[120%] rtl:translate-x-[120%]",
      )}>
        <div className="flex h-16 items-center px-5"><Logo size="h-8 w-8" /></div>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-2" aria-label="Main">
          {items.map(({ to, labelKey, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => cn("group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200", isActive ? "bg-gradient-to-r from-primary to-mixed text-white shadow-lg shadow-primary/30" : "text-slate-500 hover:bg-white/5 hover:text-slate-900")}>
              <Icon className="h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110" />
              <span className="truncate">{t(labelKey)}</span>
            </NavLink>
          ))}
        </nav>
        <div className="m-3 rounded-2xl border border-border bg-white/5 p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-700"><ShieldCheck className="h-4 w-4 text-positive" />Anonymity protected</div>
          {user && <p className="mt-1.5 truncate text-[11px] capitalize text-slate-400">{user.role} · {user.email}</p>}
        </div>
      </aside>
    </>
  );
}
