import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { NAV_BY_ROLE } from "./navConfig";
import { useAuth } from "@/features/auth/AuthContext";
import { useTranslation } from "react-i18next";
export function AppShell({ titleKey }: { titleKey: string }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = user ? NAV_BY_ROLE[user.role] : [];
  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar items={items} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={t(titleKey)} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 sm:p-6"><Outlet /></main>
      </div>
    </div>
  );
}
