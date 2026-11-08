import { Menu, Bell, LogOut } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import { LanguageSwitch } from "./LanguageSwitch";
import { useUnreadCount } from "@/features/notifications/hooks";
import { Badge } from "@/components/ui/Badge";

export function Topbar({ title, onMenuClick }: { title: string; onMenuClick: () => void }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: unreadCount } = useUnreadCount();
  const isStaff = user?.role === "hr" || user?.role === "admin";
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-ink/40 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <button className="rounded-lg p-2 text-slate-500 hover:bg-white/10 lg:hidden" onClick={onMenuClick} aria-label="Menu"><Menu className="h-5 w-5" /></button>
        <h1 className="text-base font-semibold text-slate-900 sm:text-lg">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <LanguageSwitch />
        {isStaff && (
          <button className="relative rounded-lg p-2 text-slate-500 hover:bg-white/10" onClick={() => navigate("/notifications")} aria-label={t("nav.notifications")}>
            <Bell className="h-5 w-5" />
            {!!unreadCount && <Badge tone="negative" className="absolute -right-1 -top-1 h-5 min-w-[1.25rem] justify-center px-1">{unreadCount}</Badge>}
          </button>
        )}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-white/10">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-mixed text-xs font-semibold uppercase text-white">{user?.email?.[0] ?? "?"}</div>
            <div className="hidden text-start sm:block">
              <p className="max-w-[180px] truncate text-sm font-medium leading-tight text-slate-700">{user?.email}</p>
              <p className="text-[11px] capitalize leading-tight text-slate-400">{user?.role}</p>
            </div>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content align="end" className="z-50 min-w-[180px] rounded-xl border border-border bg-[#0E1432] p-1 shadow-2xl">
              <DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-negative-600 outline-none hover:bg-negative-50" onClick={() => logout().then(() => navigate("/login"))}>
                <LogOut className="h-4 w-4" /> {t("nav.logout")}
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
