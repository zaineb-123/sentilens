import { api } from "@/lib/apiClient";
import type { OverviewResult, SentimentBreakdown, EmotionBreakdown, AspectBreakdown, TrendsResult, DepartmentComparisonResult, Alert, ServiceHealth } from "@/types";
export interface AnalyticsFilters { departmentId?: string; surveyId?: string; from?: string; to?: string; }
export const analyticsApi = {
  overview: (f: AnalyticsFilters) => api.get<OverviewResult>("/api/analytics/overview", { params: f }).then((r) => r.data),
  sentiment: (f: AnalyticsFilters) => api.get<SentimentBreakdown>("/api/analytics/sentiment", { params: f }).then((r) => r.data),
  emotions: (f: AnalyticsFilters) => api.get<EmotionBreakdown>("/api/analytics/emotions", { params: f }).then((r) => r.data),
  aspects: (f: AnalyticsFilters) => api.get<AspectBreakdown>("/api/analytics/aspects", { params: f }).then((r) => r.data),
  trends: (f: AnalyticsFilters) => api.get<TrendsResult>("/api/analytics/trends", { params: f }).then((r) => r.data),
  departments: (f: AnalyticsFilters, departmentIds: string[]) => api.get<DepartmentComparisonResult>("/api/analytics/departments", { params: { ...f, departmentIds: departmentIds.join(",") } }).then((r) => r.data),
  exportCsv: (f: AnalyticsFilters) => api.get("/api/analytics/export", { params: f, responseType: "blob" }).then((r) => r.data as Blob),
  alerts: (status?: string) => api.get<{ alerts: Alert[] }>("/api/alerts", { params: { status } }).then((r) => r.data.alerts),
  acknowledgeAlert: (id: string) => api.patch<{ alert: Alert }>(`/api/alerts/${id}`).then((r) => r.data.alert),
  systemHealth: () => api.get<ServiceHealth>("/api/system/health").then((r) => r.data),
};
