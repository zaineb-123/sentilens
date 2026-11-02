import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { organizationApi } from "./api";
export function useMyProfile() { return useQuery({ queryKey: ["org", "my-profile"], queryFn: organizationApi.myProfile, retry: false }); }
export function useUpdateMyProfile() { const qc = useQueryClient(); return useMutation({ mutationFn: organizationApi.updateMyProfile, onSuccess: () => qc.invalidateQueries({ queryKey: ["org", "my-profile"] }) }); }
export function useDepartments() { return useQuery({ queryKey: ["org", "departments"], queryFn: organizationApi.listDepartments }); }
export function useCreateDepartment() { const qc = useQueryClient(); return useMutation({ mutationFn: organizationApi.createDepartment, onSuccess: () => qc.invalidateQueries({ queryKey: ["org", "departments"] }) }); }
export function useUpdateDepartment() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, name }: { id: string; name: string }) => organizationApi.updateDepartment(id, name), onSuccess: () => qc.invalidateQueries({ queryKey: ["org", "departments"] }) }); }
export function useDeleteDepartment() { const qc = useQueryClient(); return useMutation({ mutationFn: organizationApi.deleteDepartment, onSuccess: () => qc.invalidateQueries({ queryKey: ["org", "departments"] }) }); }
export function useOrganizations() { return useQuery({ queryKey: ["org", "organizations"], queryFn: organizationApi.listOrganizations }); }
export function useCreateOrganization() { const qc = useQueryClient(); return useMutation({ mutationFn: organizationApi.createOrganization, onSuccess: () => qc.invalidateQueries({ queryKey: ["org", "organizations"] }) }); }
export function useUpdateOrgSettings() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, settings }: { id: string; settings: Record<string, unknown> }) => organizationApi.updateSettings(id, settings), onSuccess: () => qc.invalidateQueries({ queryKey: ["org", "organizations"] }) }); }
export function useAuditLogs(params?: { action?: string; resource?: string }) { return useQuery({ queryKey: ["org", "audit-logs", params], queryFn: () => organizationApi.auditLogs(params) }); }
