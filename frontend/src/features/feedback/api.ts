import { api } from "@/lib/apiClient";
import type { FeedbackSubmitResponse, ReceiptStatus, ExplorerResult, ImportBatch } from "@/types";
export interface SubmitFeedbackPayload { surveyId?: string; answers?: { questionId: string; value: string | number | string[] }[]; comment?: string; }
export interface ExplorerFilters { surveyId?: string; departmentId?: string; from?: string; to?: string; limit?: number; }
export const feedbackApi = {
  submit: (payload: SubmitFeedbackPayload) => api.post<FeedbackSubmitResponse>("/api/feedback", payload).then((r) => r.data),
  receiptStatus: (code: string) => api.get<ReceiptStatus>(`/api/feedback/receipt/${code}`).then((r) => r.data),
  explore: (filters: ExplorerFilters) => api.get<ExplorerResult>("/api/feedback", { params: filters }).then((r) => r.data),
  importCsv: (file: File) => { const form = new FormData(); form.append("file", file); return api.post<{ batch: ImportBatch }>("/api/feedback/import", form, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data.batch); },
  getBatch: (id: string) => api.get<{ batch: ImportBatch }>(`/api/feedback/batches/${id}`).then((r) => r.data.batch),
};
