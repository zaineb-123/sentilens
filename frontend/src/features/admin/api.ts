import { api } from "@/lib/apiClient";
import type { User, Role, UserStatus } from "@/types";
export const adminApi = {
  listUsers: (params?: { role?: Role; status?: UserStatus }) => api.get<{ users: User[] }>("/api/auth/users", { params }).then((r) => r.data.users),
  inviteUser: (payload: { email: string; role: Role }) => api.post<{ invitation: unknown; invitationCode: string }>("/api/auth/users/invite", payload).then((r) => r.data),
  updateUserStatus: (id: string, status: UserStatus) => api.patch<{ user: User }>(`/api/auth/users/${id}/status`, { status }).then((r) => r.data.user),
};
