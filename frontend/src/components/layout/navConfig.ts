import {
  LayoutDashboard, ClipboardList, MessageSquareText, History, UserCircle, ShieldCheck,
  BarChart3, Smile, Tags, TrendingUp, Building2, Search, Bell, FileBarChart,
  Users, Boxes, KeyRound, ScrollText, Activity, Settings as SettingsIcon, Inbox,
} from "lucide-react";
import type { Role } from "@/types";
import type { LucideIcon } from "lucide-react";
export interface NavItem { to: string; labelKey: string; icon: LucideIcon }
export const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  employee: [
    { to: "/app/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
    { to: "/app/surveys", labelKey: "nav.surveys", icon: ClipboardList },
    { to: "/app/feedback", labelKey: "employee.feedback.anonymousTitle", icon: MessageSquareText },
    { to: "/app/my-feedback", labelKey: "employee.v2.myfeedback.title", icon: Inbox },
    { to: "/app/history", labelKey: "nav.history", icon: History },
    { to: "/app/profile", labelKey: "nav.profile", icon: UserCircle },
    { to: "/app/privacy", labelKey: "nav.privacy", icon: ShieldCheck },
  ],
  hr: [
    { to: "/hr/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
    { to: "/hr/sentiment", labelKey: "nav.sentiment", icon: BarChart3 },
    { to: "/hr/emotions", labelKey: "nav.emotions", icon: Smile },
    { to: "/hr/aspects", labelKey: "nav.aspects", icon: Tags },
    { to: "/hr/trends", labelKey: "nav.trends", icon: TrendingUp },
    { to: "/hr/departments", labelKey: "nav.departments", icon: Building2 },
    { to: "/hr/feedback", labelKey: "hr.explorer.title", icon: Search },
    { to: "/hr/surveys", labelKey: "hr.surveys.title", icon: ClipboardList },
    { to: "/hr/alerts", labelKey: "nav.alerts", icon: Bell },
    { to: "/hr/reports", labelKey: "nav.reports", icon: FileBarChart },
  ],
  admin: [
    { to: "/admin/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
    { to: "/admin/users", labelKey: "nav.users", icon: Users },
    { to: "/admin/organizations", labelKey: "nav.organizations", icon: Boxes },
    { to: "/admin/departments", labelKey: "nav.departments", icon: Building2 },
    { to: "/admin/roles", labelKey: "nav.roles", icon: KeyRound },
    { to: "/admin/audit-logs", labelKey: "nav.auditLogs", icon: ScrollText },
    { to: "/admin/monitoring", labelKey: "nav.monitoring", icon: Activity },
    { to: "/admin/settings", labelKey: "nav.settings", icon: SettingsIcon },
  ],
};
export const ROLE_HOME: Record<Role, string> = { employee: "/app/dashboard", hr: "/hr/dashboard", admin: "/admin/dashboard" };
