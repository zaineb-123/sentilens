import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useState } from "react";
import { authApi } from "@/features/auth/api";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CheckCircle2 } from "lucide-react";

const schema = z.object({ email: z.string().email() });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const onSubmit = async (values: FormValues) => { await authApi.forgotPassword(values.email); setSent(true); };
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-white/5 p-6 shadow-card">
        <h1 className="mb-5 text-lg font-semibold text-slate-900">{t("auth.forgotPassword")}</h1>
        {sent ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center"><CheckCircle2 className="h-8 w-8 text-positive-600" /><p className="text-sm text-slate-600">{t("auth.resetSent")}</p></div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div><Label htmlFor="email">{t("auth.email")}</Label><Input id="email" type="email" {...register("email")} /><FieldError>{errors.email?.message}</FieldError></div>
            <Button type="submit" className="w-full" loading={isSubmitting}>{t("common.submit")}</Button>
          </form>
        )}
        <p className="mt-4 text-center text-sm text-slate-500"><Link to="/login" className="font-medium text-primary-600 hover:underline">{t("auth.login")}</Link></p>
      </div>
    </div>
  );
}
