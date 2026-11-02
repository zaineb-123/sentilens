import { api } from "@/lib/apiClient";
import type { User } from "@/types";

export interface LoginPayload { email: string; password: string }
export interface RegisterPayload { email: string; password: string; invitationCode: string }
export interface SessionResponse { user: User; accessToken: string }

export const authApi = {
  login: (payload: LoginPayload) => api.post<SessionResponse>("/api/auth/login", payload).then((r) => r.data),
  register: (payload: RegisterPayload) => api.post<SessionResponse>("/api/auth/register", payload).then((r) => r.data),
  logout: () => api.post("/api/auth/logout"),
  me: () => api.get<{ user: User }>("/api/auth/me").then((r) => r.data.user),
  forgotPassword: (email: string) => api.post<{ message: string }>("/api/auth/forgot-password", { email }).then((r) => r.data),
  resetPassword: (token: string, password: string) => api.post<{ message: string }>("/api/auth/reset-password", { token, password }).then((r) => r.data),
};
