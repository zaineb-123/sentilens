import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "./api";
import type { Role, UserStatus } from "@/types";
export function useAdminUsers(params?: { role?: Role; status?: UserStatus }) { return useQuery({ queryKey: ["admin", "users", params], queryFn: () => adminApi.listUsers(params) }); }
export function useInviteUser() { const qc = useQueryClient(); return useMutation({ mutationFn: adminApi.inviteUser, onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }) }); }
export function useUpdateUserStatus() { const qc = useQueryClient(); return useMutation({ mutationFn: ({ id, status }: { id: string; status: UserStatus }) => adminApi.updateUserStatus(id, status), onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }) }); }
