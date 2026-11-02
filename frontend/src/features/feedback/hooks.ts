import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { feedbackApi, type ExplorerFilters, type SubmitFeedbackPayload } from "./api";
export function useSubmitFeedback() { const qc = useQueryClient(); return useMutation({ mutationFn: (p: SubmitFeedbackPayload) => feedbackApi.submit(p), onSuccess: () => qc.invalidateQueries({ queryKey: ["surveys"] }) }); }
export function useReceiptStatus(code: string | undefined, opts?: { pollWhilePending?: boolean }) {
  return useQuery({
    queryKey: ["feedback", "receipt", code], queryFn: () => feedbackApi.receiptStatus(code as string), enabled: !!code,
    refetchInterval: (query) => { if (!opts?.pollWhilePending) return false; const status = query.state.data?.analysisStatus; return status === "pending" || status === "processing" ? 4000 : false; },
  });
}
export function useFeedbackExplorer(filters: ExplorerFilters) { return useQuery({ queryKey: ["feedback", "explorer", filters], queryFn: () => feedbackApi.explore(filters) }); }
export function useImportCsv() { return useMutation({ mutationFn: feedbackApi.importCsv }); }
export function useImportBatch(id: string | undefined, opts?: { pollWhileProcessing?: boolean }) {
  return useQuery({ queryKey: ["feedback", "batch", id], queryFn: () => feedbackApi.getBatch(id as string), enabled: !!id, refetchInterval: (query) => (opts?.pollWhileProcessing && query.state.data?.status === "processing" ? 3000 : false) });
}
