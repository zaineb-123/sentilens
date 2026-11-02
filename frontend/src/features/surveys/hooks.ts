import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { surveysApi, type CreateSurveyPayload } from "./api";
export function useAvailableSurveys() { return useQuery({ queryKey: ["surveys", "available"], queryFn: surveysApi.listAvailable }); }
export function useAvailableSurvey(id: string | undefined) { return useQuery({ queryKey: ["surveys", "available", id], queryFn: () => surveysApi.getAvailable(id as string), enabled: !!id }); }
export function useMyParticipations() { return useQuery({ queryKey: ["surveys", "participations"], queryFn: surveysApi.myParticipations }); }
export function useHrSurveys(status?: string) { return useQuery({ queryKey: ["surveys", "hr", status], queryFn: () => surveysApi.listForHr(status) }); }
export function useSurvey(id: string | undefined) { return useQuery({ queryKey: ["surveys", "hr", "detail", id], queryFn: () => surveysApi.get(id as string), enabled: !!id }); }
export function useSurveyParticipation(id: string | undefined) { return useQuery({ queryKey: ["surveys", "participation", id], queryFn: () => surveysApi.participationStats(id as string), enabled: !!id }); }
function useInvalidateSurveys() { const qc = useQueryClient(); return () => qc.invalidateQueries({ queryKey: ["surveys"] }); }
export function useCreateSurvey() { const inv = useInvalidateSurveys(); return useMutation({ mutationFn: (p: CreateSurveyPayload) => surveysApi.create(p), onSuccess: inv }); }
export function useUpdateSurvey() { const inv = useInvalidateSurveys(); return useMutation({ mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateSurveyPayload> }) => surveysApi.update(id, payload), onSuccess: inv }); }
export function usePublishSurvey() { const inv = useInvalidateSurveys(); return useMutation({ mutationFn: surveysApi.publish, onSuccess: inv }); }
export function useCloseSurvey() { const inv = useInvalidateSurveys(); return useMutation({ mutationFn: surveysApi.close, onSuccess: inv }); }
export function useDeleteSurvey() { const inv = useInvalidateSurveys(); return useMutation({ mutationFn: surveysApi.remove, onSuccess: inv }); }
