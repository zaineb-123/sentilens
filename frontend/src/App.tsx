import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { PageLoader } from "@/components/domain/States";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/features/auth/AuthContext";
import { ROLE_HOME } from "@/components/layout/navConfig";

const LandingPage = lazy(() => import("@/pages/public/LandingPage"));
const HowItWorksPage = lazy(() => import("@/pages/public/HowItWorksPage"));
const PrivacyPage = lazy(() => import("@/pages/public/PrivacyPage"));
const LoginPage = lazy(() => import("@/pages/public/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/public/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/public/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/public/ResetPasswordPage"));

const EmployeeDashboardPage = lazy(() => import("@/pages/employee/EmployeeDashboardPage"));
const SurveysListPage = lazy(() => import("@/pages/employee/SurveysListPage"));
const SurveyAnswerPage = lazy(() => import("@/pages/employee/SurveyAnswerPage"));
const AnonymousFeedbackPage = lazy(() => import("@/pages/employee/AnonymousFeedbackPage"));
const FeedbackSuccessPage = lazy(() => import("@/pages/employee/FeedbackSuccessPage"));
const ParticipationHistoryPage = lazy(() => import("@/pages/employee/ParticipationHistoryPage"));
const MyFeedbackPage = lazy(() => import("@/pages/employee/MyFeedbackPage"));
const ProfilePage = lazy(() => import("@/pages/employee/ProfilePage"));
const PrivacySettingsPage = lazy(() => import("@/pages/employee/PrivacySettingsPage"));

const HrDashboardPage = lazy(() => import("@/pages/hr/HrDashboardPage"));
const SentimentAnalyticsPage = lazy(() => import("@/pages/hr/SentimentAnalyticsPage"));
const EmotionAnalyticsPage = lazy(() => import("@/pages/hr/EmotionAnalyticsPage"));
const AspectAnalyticsPage = lazy(() => import("@/pages/hr/AspectAnalyticsPage"));
const TrendsPage = lazy(() => import("@/pages/hr/TrendsPage"));
const DepartmentComparisonPage = lazy(() => import("@/pages/hr/DepartmentComparisonPage"));
const FeedbackExplorerPage = lazy(() => import("@/pages/hr/FeedbackExplorerPage"));
const SurveyManagementPage = lazy(() => import("@/pages/hr/SurveyManagementPage"));
const SurveyBuilderPage = lazy(() => import("@/pages/hr/SurveyBuilderPage"));
const SurveyResultsPage = lazy(() => import("@/pages/hr/SurveyResultsPage"));
const AlertsPage = lazy(() => import("@/pages/hr/AlertsPage"));
const ReportsPage = lazy(() => import("@/pages/hr/ReportsPage"));

const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage"));
const AdminUsersPage = lazy(() => import("@/pages/admin/AdminUsersPage"));
const AdminOrganizationsPage = lazy(() => import("@/pages/admin/AdminOrganizationsPage"));
const AdminDepartmentsPage = lazy(() => import("@/pages/admin/AdminDepartmentsPage"));
const AdminRolesPage = lazy(() => import("@/pages/admin/AdminRolesPage"));
const AdminAuditLogsPage = lazy(() => import("@/pages/admin/AdminAuditLogsPage"));
const AdminMonitoringPage = lazy(() => import("@/pages/admin/AdminMonitoringPage"));
const AdminSettingsPage = lazy(() => import("@/pages/admin/AdminSettingsPage"));

const NotFoundPage = lazy(() => import("@/pages/system/NotFoundPage"));
const UnauthorizedPage = lazy(() => import("@/pages/system/UnauthorizedPage"));
const ServiceUnavailablePage = lazy(() => import("@/pages/system/ServiceUnavailablePage"));
const NotificationCenterPage = lazy(() => import("@/pages/system/NotificationCenterPage"));

function RoleHomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={user ? ROLE_HOME[user.role] : "/login"} replace />;
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
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
        <Route element={<AppShell titleKey="employee.v2.myfeedback.title" />}><Route path="/app/my-feedback" element={<MyFeedbackPage />} /></Route>
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
    </Suspense>
  );
}
