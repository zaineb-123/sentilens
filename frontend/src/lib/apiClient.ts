import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getAccessToken, setAccessToken } from "./tokenStore";
import type { ApiErrorBody } from "@/types";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
export const api = axios.create({ baseURL, withCredentials: true });

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise: Promise<string | null> | null = null;
async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${baseURL}/api/auth/refresh`, {}, { withCredentials: true })
      .then((res) => { const token = res.data?.accessToken as string | undefined; setAccessToken(token ?? null); return token ?? null; })
      .catch(() => { setAccessToken(null); return null; })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const isAuthRoute = original?.url?.includes("/api/auth/");
    if (error.response?.status === 401 && original && !original._retried && !isAuthRoute) {
      original._retried = true;
      const newToken = await refreshAccessToken();
      if (newToken) { original.headers.Authorization = `Bearer ${newToken}`; return api(original); }
    }
    return Promise.reject(error);
  },
);

export function apiErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ApiErrorBody | undefined;
    if (body?.error?.message) return body.error.message;
    if (error.code === "ERR_NETWORK") return "The server is unreachable. Please try again.";
  }
  return fallback;
}
export { refreshAccessToken };
