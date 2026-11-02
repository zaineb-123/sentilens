import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/AuthContext";
import type { Role } from "@/types";
import { LoadingSkeleton } from "@/components/domain/States";
export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { status, user } = useAuth();
  const location = useLocation();
  if (status === "loading") return <div className="flex min-h-screen items-center justify-center p-6"><LoadingSkeleton rows={3} className="w-full max-w-sm" /></div>;
  if (status === "unauthenticated" || !user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}
