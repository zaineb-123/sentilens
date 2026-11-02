import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi, type LoginPayload } from "./api";
import { getAccessToken, setAccessToken } from "@/lib/tokenStore";
import { refreshAccessToken } from "@/lib/apiClient";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null; status: "loading" | "authenticated" | "unauthenticated";
  login: (payload: LoginPayload) => Promise<void>; logout: () => Promise<void>; refetchMe: () => Promise<void>;
}
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");

  const loadMe = useCallback(async () => {
    try { setUser(await authApi.me()); setStatus("authenticated"); }
    catch { setUser(null); setStatus("unauthenticated"); }
  }, []);

  useEffect(() => {
    (async () => {
      if (!getAccessToken()) {
        const token = await refreshAccessToken();
        if (!token) { setStatus("unauthenticated"); return; }
      }
      await loadMe();
    })();
  }, [loadMe]);

  const login = useCallback(async (payload: LoginPayload) => {
    const session = await authApi.login(payload);
    setAccessToken(session.accessToken); setUser(session.user); setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } finally { setAccessToken(null); setUser(null); setStatus("unauthenticated"); }
  }, []);

  return <AuthContext.Provider value={{ user, status, login, logout, refetchMe: loadMe }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
