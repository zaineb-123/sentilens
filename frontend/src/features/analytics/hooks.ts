import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { analyticsApi, type AnalyticsFilters } from "./api";
export function useOverview(f: AnalyticsFilters) { return useQuery({ queryKey: ["analytics", "overview", f], queryFn: () => analyticsApi.overview(f) }); }
export function useSentimentBreakdown(f: AnalyticsFilters) { return useQuery({ queryKey: ["analytics", "sentiment", f], queryFn: () => analyticsApi.sentiment(f) }); }
export function useEmotionBreakdown(f: AnalyticsFilters) { return useQuery({ queryKey: ["analytics", "emotions", f], queryFn: () => analyticsApi.emotions(f) }); }
export function useAspectBreakdown(f: AnalyticsFilters) { return useQuery({ queryKey: ["analytics", "aspects", f], queryFn: () => analyticsApi.aspects(f) }); }
export function useTrends(f: AnalyticsFilters) { return useQuery({ queryKey: ["analytics", "trends", f], queryFn: () => analyticsApi.trends(f) }); }
export function useDepartmentComparison(f: AnalyticsFilters, departmentIds: string[]) { return useQuery({ queryKey: ["analytics", "departments", f, departmentIds], queryFn: () => analyticsApi.departments(f, departmentIds), enabled: departmentIds.length > 0 }); }
export function useAlerts(status?: string) { return useQuery({ queryKey: ["alerts", status], queryFn: () => analyticsApi.alerts(status) }); }
export function useAcknowledgeAlert() { const qc = useQueryClient(); return useMutation({ mutationFn: analyticsApi.acknowledgeAlert, onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts"] }) }); }
export function useSystemHealth() { return useQuery({ queryKey: ["system", "health"], queryFn: analyticsApi.systemHealth, refetchInterval: 15_000 }); }
