import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { apiErrorMessage } from "@/lib/apiClient";
import { Logo } from "@/components/brand/Logo";

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname: string } } };
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
  await login(values);
  navigate(location.state?.from?.pathname ?? "/home", { replace: true });
}
    catch (e) { setServerError(apiErrorMessage(e, t("auth.loginError"))); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <Logo />
        </Link>
        <div className="rounded-2xl border border-border bg-white/5 p-6 shadow-card">
          <h1 className="mb-5 text-lg font-semibold text-slate-900">{t("auth.login")}</h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div><Label htmlFor="email">{t("auth.email")}</Label><Input id="email" type="email" autoComplete="email" {...register("email")} /><FieldError>{errors.email?.message}</FieldError></div>
            <div>
              <div className="flex items-center justify-between"><Label htmlFor="password">{t("auth.password")}</Label><Link to="/forgot-password" className="text-xs font-medium text-primary-600 hover:underline">{t("auth.forgotPassword")}</Link></div>
              <Input id="password" type="password" autoComplete="current-password" {...register("password")} /><FieldError>{errors.password?.message}</FieldError>
            </div>
            {serverError && <p className="rounded-lg bg-negative-50 px-3 py-2 text-sm text-negative-700">{serverError}</p>}
            <Button type="submit" className="w-full" loading={isSubmitting}>{t("auth.loginCta")}</Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-500">{t("auth.noAccount")} <Link to="/register" className="font-medium text-primary-600 hover:underline">{t("auth.register")}</Link></p>
        </div>
      </div>
    </div>
  );
}
