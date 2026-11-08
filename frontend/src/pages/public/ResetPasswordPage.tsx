import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { authApi } from "@/features/auth/api";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { apiErrorMessage } from "@/lib/apiClient";

const schema = z.object({ password: z.string().min(10, "At least 10 characters") });
type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try { await authApi.resetPassword(token, values.password); navigate("/login", { state: { resetSuccess: true } }); }
    catch (e) { setServerError(apiErrorMessage(e, "This reset link is invalid or has expired.")); }
  };

  if (!token) {
    return <div className="flex min-h-screen items-center justify-center p-6 text-center text-sm text-slate-500">Missing reset token. Use the link from your email, or <Link to="/forgot-password" className="text-primary-600 hover:underline">request a new one</Link>.</div>;
  }
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-white/5 p-6 shadow-card">
        <h1 className="mb-5 text-lg font-semibold text-slate-900">{t("auth.resetPassword")}</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div><Label htmlFor="password">{t("auth.newPassword")}</Label><Input id="password" type="password" autoComplete="new-password" {...register("password")} /><FieldError>{errors.password?.message}</FieldError></div>
          {serverError && <p className="rounded-lg bg-negative-50 px-3 py-2 text-sm text-negative-700">{serverError}</p>}
          <Button type="submit" className="w-full" loading={isSubmitting}>{t("common.save")}</Button>
        </form>
      </div>
    </div>
  );
}
