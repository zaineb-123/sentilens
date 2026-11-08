import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { authApi } from "@/features/auth/api";
import { useAuth } from "@/features/auth/AuthContext";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { apiErrorMessage } from "@/lib/apiClient";
import { setAccessToken } from "@/lib/tokenStore";
import { Logo } from "@/components/brand/Logo";

const schema = z.object({ email: z.string().email(), invitationCode: z.string().min(6, "Invitation code looks too short"), password: z.string().min(10, "At least 10 characters") });
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const { t } = useTranslation();
  const { refetchMe } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
  setServerError(null);
  try {
    await authApi.register(values);
    navigate("/login", {
      replace: true,
      state: { registered: true },
    });
  } catch (e) {
    setServerError(apiErrorMessage(e, "Could not create your account."));
  }
};

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <Logo />
        </Link>
        <div className="rounded-2xl border border-border bg-white/5 p-6 shadow-card">
          <h1 className="mb-1 text-lg font-semibold text-slate-900">{t("auth.register")}</h1>
          <p className="mb-5 text-sm text-slate-500">Registration is invite-only — ask your administrator for a code.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div><Label htmlFor="email">{t("auth.email")}</Label><Input id="email" type="email" autoComplete="email" {...register("email")} /><FieldError>{errors.email?.message}</FieldError></div>
            <div><Label htmlFor="invitationCode">{t("auth.invitationCode")}</Label><Input id="invitationCode" {...register("invitationCode")} /><FieldError>{errors.invitationCode?.message}</FieldError></div>
            <div><Label htmlFor="password">{t("auth.password")}</Label><Input id="password" type="password" autoComplete="new-password" {...register("password")} /><FieldError>{errors.password?.message}</FieldError></div>
            {serverError && <p className="rounded-lg bg-negative-50 px-3 py-2 text-sm text-negative-700">{serverError}</p>}
            <Button type="submit" className="w-full" loading={isSubmitting}>{t("auth.register")}</Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-500"><Link to="/login" className="font-medium text-primary-600 hover:underline">{t("auth.login")}</Link></p>
        </div>
      </div>
    </div>
  );
}
