import { api } from "@/lib/apiClient";
import type { Department, Organization, AuditLogEntry } from "@/types";
export interface EmployeeProfile { userId: string; orgId: string; departmentId: string | null; locale: string }
export const organizationApi = {
  myProfile: () => api.get<{ profile: EmployeeProfile }>("/api/me/profile").then((r) => r.data.profile),
  updateMyProfile: (payload: Partial<Pick<EmployeeProfile, "departmentId" | "locale">>) => api.patch<{ profile: EmployeeProfile }>("/api/me/profile", payload).then((r) => r.data.profile),
  listDepartments: () => api.get<{ departments: Department[] }>("/api/departments").then((r) => r.data.departments),
  createDepartment: (name: string) => api.post<{ department: Department }>("/api/departments", { name }).then((r) => r.data.department),
  updateDepartment: (id: string, name: string) => api.put<{ department: Department }>(`/api/departments/${id}`, { name }).then((r) => r.data.department),
  deleteDepartment: (id: string) => api.delete(`/api/departments/${id}`),
  listOrganizations: () => api.get<{ organizations: Organization[] }>("/api/organizations").then((r) => r.data.organizations),
  getOrganization: (id: string) => api.get<{ organization: Organization }>(`/api/organizations/${id}`).then((r) => r.data.organization),
  createOrganization: (payload: { name: string; slug: string }) => api.post<{ organization: Organization }>("/api/organizations", payload).then((r) => r.data.organization),
  updateSettings: (id: string, settings: Partial<Organization["settings"]>) => api.put<{ organization: Organization }>(`/api/organizations/${id}/settings`, settings).then((r) => r.data.organization),
  auditLogs: (params?: { action?: string; resource?: string; limit?: number }) => api.get<{ logs: AuditLogEntry[]; nextCursor: string | null }>("/api/audit-logs", { params }).then((r) => r.data),
};
