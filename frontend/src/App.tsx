import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/features/auth/AuthContext";
import { ROLE_HOME } from "@/components/layout/navConfig";

import LandingPage from "@/pages/public/LandingPage";
import HowItWorksPage from "@/pages/public/HowItWorksPage";
import PrivacyPage from "@/pages/public/PrivacyPage";
import LoginPage from "@/pages/public/LoginPage";
import RegisterPage from "@/pages/public/RegisterPage";
import ForgotPasswordPage from "@/pages/public/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/public/ResetPasswordPage";
import DemoPage from "@/pages/public/DemoPage";

import EmployeeDashboardPage from "@/pages/employee/EmployeeDashboardPage";
import SurveysListPage from "@/pages/employee/SurveysListPage";
import SurveyAnswerPage from "@/pages/employee/SurveyAnswerPage";
import AnonymousFeedbackPage from "@/pages/employee/AnonymousFeedbackPage";
import FeedbackSuccessPage from "@/pages/employee/FeedbackSuccessPage";
import ParticipationHistoryPage from "@/pages/employee/ParticipationHistoryPage";
import ProfilePage from "@/pages/employee/ProfilePage";
import PrivacySettingsPage from "@/pages/employee/PrivacySettingsPage";

import HrDashboardPage from "@/pages/hr/HrDashboardPage";
import SentimentAnalyticsPage from "@/pages/hr/SentimentAnalyticsPage";
import EmotionAnalyticsPage from "@/pages/hr/EmotionAnalyticsPage";
import AspectAnalyticsPage from "@/pages/hr/AspectAnalyticsPage";
import TrendsPage from "@/pages/hr/TrendsPage";
import DepartmentComparisonPage from "@/pages/hr/DepartmentComparisonPage";
import FeedbackExplorerPage from "@/pages/hr/FeedbackExplorerPage";
import SurveyManagementPage from "@/pages/hr/SurveyManagementPage";
import SurveyBuilderPage from "@/pages/hr/SurveyBuilderPage";
import SurveyResultsPage from "@/pages/hr/SurveyResultsPage";
import AlertsPage from "@/pages/hr/AlertsPage";
import ReportsPage from "@/pages/hr/ReportsPage";

import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminOrganizationsPage from "@/pages/admin/AdminOrganizationsPage";
import AdminDepartmentsPage from "@/pages/admin/AdminDepartmentsPage";
import AdminRolesPage from "@/pages/admin/AdminRolesPage";
import AdminAuditLogsPage from "@/pages/admin/AdminAuditLogsPage";
import AdminMonitoringPage from "@/pages/admin/AdminMonitoringPage";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";

import NotFoundPage from "@/pages/system/NotFoundPage";
import UnauthorizedPage from "@/pages/system/UnauthorizedPage";
import ServiceUnavailablePage from "@/pages/system/ServiceUnavailablePage";
import NotificationCenterPage from "@/pages/system/NotificationCenterPage";

function RoleHomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? ROLE_HOME[user.role] : "/login"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/demo" element={<DemoPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/service-unavailable" element={<ServiceUnavailablePage />} />

      <Route path="/home" element={<ProtectedRoute />}>
        <Route index element={<RoleHomeRedirect />} />
      </Route>

      <Route element={<ProtectedRoute roles={["hr", "admin"]} />}>
        <Route element={<AppShell titleKey="nav.notifications" />}>
          <Route path="/notifications" element={<NotificationCenterPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["employee"]} />}>
        <Route element={<AppShell titleKey="employee.dashboard.title" />}><Route path="/app/dashboard" element={<EmployeeDashboardPage />} /></Route>
        <Route element={<AppShell titleKey="nav.surveys" />}>
          <Route path="/app/surveys" element={<SurveysListPage />} />
          <Route path="/app/surveys/:id" element={<SurveyAnswerPage />} />
        </Route>
        <Route element={<AppShell titleKey="employee.feedback.anonymousTitle" />}>
          <Route path="/app/feedback" element={<AnonymousFeedbackPage />} />
          <Route path="/app/feedback/success" element={<FeedbackSuccessPage />} />
        </Route>
        <Route element={<AppShell titleKey="nav.history" />}><Route path="/app/history" element={<ParticipationHistoryPage />} /></Route>
        <Route element={<AppShell titleKey="nav.profile" />}><Route path="/app/profile" element={<ProfilePage />} /></Route>
        <Route element={<AppShell titleKey="nav.privacy" />}><Route path="/app/privacy" element={<PrivacySettingsPage />} /></Route>
      </Route>

      <Route element={<ProtectedRoute roles={["hr"]} />}>
        <Route element={<AppShell titleKey="hr.dashboard.title" />}><Route path="/hr/dashboard" element={<HrDashboardPage />} /></Route>
        <Route element={<AppShell titleKey="nav.sentiment" />}><Route path="/hr/sentiment" element={<SentimentAnalyticsPage />} /></Route>
        <Route element={<AppShell titleKey="nav.emotions" />}><Route path="/hr/emotions" element={<EmotionAnalyticsPage />} /></Route>
        <Route element={<AppShell titleKey="nav.aspects" />}><Route path="/hr/aspects" element={<AspectAnalyticsPage />} /></Route>
        <Route element={<AppShell titleKey="nav.trends" />}><Route path="/hr/trends" element={<TrendsPage />} /></Route>
        <Route element={<AppShell titleKey="nav.departments" />}><Route path="/hr/departments" element={<DepartmentComparisonPage />} /></Route>
        <Route element={<AppShell titleKey="hr.explorer.title" />}><Route path="/hr/feedback" element={<FeedbackExplorerPage />} /></Route>
        <Route element={<AppShell titleKey="hr.surveys.title" />}>
          <Route path="/hr/surveys" element={<SurveyManagementPage />} />
          <Route path="/hr/surveys/new" element={<SurveyBuilderPage />} />
          <Route path="/hr/surveys/:id/edit" element={<SurveyBuilderPage />} />
          <Route path="/hr/surveys/:id/results" element={<SurveyResultsPage />} />
        </Route>
        <Route element={<AppShell titleKey="nav.alerts" />}><Route path="/hr/alerts" element={<AlertsPage />} /></Route>
        <Route element={<AppShell titleKey="nav.reports" />}><Route path="/hr/reports" element={<ReportsPage />} /></Route>
      </Route>

      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route element={<AppShell titleKey="admin.dashboard.title" />}><Route path="/admin/dashboard" element={<AdminDashboardPage />} /></Route>
        <Route element={<AppShell titleKey="nav.users" />}><Route path="/admin/users" element={<AdminUsersPage />} /></Route>
        <Route element={<AppShell titleKey="nav.organizations" />}><Route path="/admin/organizations" element={<AdminOrganizationsPage />} /></Route>
        <Route element={<AppShell titleKey="nav.departments" />}><Route path="/admin/departments" element={<AdminDepartmentsPage />} /></Route>
        <Route element={<AppShell titleKey="nav.roles" />}><Route path="/admin/roles" element={<AdminRolesPage />} /></Route>
        <Route element={<AppShell titleKey="nav.auditLogs" />}><Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} /></Route>
        <Route element={<AppShell titleKey="nav.monitoring" />}><Route path="/admin/monitoring" element={<AdminMonitoringPage />} /></Route>
        <Route element={<AppShell titleKey="nav.settings" />}><Route path="/admin/settings" element={<AdminSettingsPage />} /></Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
