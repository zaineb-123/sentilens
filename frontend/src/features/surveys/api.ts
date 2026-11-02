import { api } from "@/lib/apiClient";
import type { Survey, Question, LocalizedText } from "@/types";
export interface CreateSurveyPayload { title: LocalizedText; description?: LocalizedText; targetDepartmentIds?: string[]; opensAt?: string | null; closesAt?: string | null; questions?: Omit<Question, "_id">[]; }
export const surveysApi = {
  listAvailable: () => api.get<{ surveys: Survey[] }>("/api/surveys/available").then((r) => r.data.surveys),
  getAvailable: (id: string) => api.get<{ survey: Survey }>(`/api/surveys/available/${id}`).then((r) => r.data.survey),
  myParticipations: () => api.get<{ participations: { surveyId: string; at: string }[] }>("/api/me/participations").then((r) => r.data.participations),
  listForHr: (status?: string) => api.get<{ surveys: Survey[] }>("/api/surveys", { params: { status } }).then((r) => r.data.surveys),
  get: (id: string) => api.get<{ survey: Survey }>(`/api/surveys/${id}`).then((r) => r.data.survey),
  create: (payload: CreateSurveyPayload) => api.post<{ survey: Survey }>("/api/surveys", payload).then((r) => r.data.survey),
  update: (id: string, payload: Partial<CreateSurveyPayload>) => api.put<{ survey: Survey }>(`/api/surveys/${id}`, payload).then((r) => r.data.survey),
  remove: (id: string) => api.delete(`/api/surveys/${id}`),
  publish: (id: string) => api.post<{ survey: Survey }>(`/api/surveys/${id}/publish`).then((r) => r.data.survey),
  close: (id: string) => api.post<{ survey: Survey }>(`/api/surveys/${id}/close`).then((r) => r.data.survey),
  participationStats: (id: string) => api.get<{ surveyId: string; totalParticipants: number; status: string }>(`/api/surveys/${id}/participation`).then((r) => r.data),
};
