import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useSubmitFeedback } from "@/features/feedback/hooks";
import { Textarea, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { apiErrorMessage } from "@/lib/apiClient";
interface FormValues { comment: string }
export default function AnonymousFeedbackPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const submitFeedback = useSubmitFeedback();
  const [serverError, setServerError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try { const result = await submitFeedback.mutateAsync({ comment: values.comment }); navigate("/app/feedback/success", { state: { receiptCode: result.receiptCode } }); }
    catch (e) { setServerError(apiErrorMessage(e)); }
  };
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 text-lg font-semibold text-slate-900">{t("employee.feedback.anonymousTitle")}</h1>
      <p className="mb-6 text-sm text-slate-500">{t("employee.feedback.commentLabel")}</p>
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-primary-100 bg-primary-50 p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
        <p className="text-sm text-primary-800">{t("employee.feedback.privacyNote")}</p>
      </div>
      <Card><CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Textarea rows={6} placeholder={t("employee.feedback.commentPlaceholder") ?? ""} {...register("comment", { required: true, minLength: 3, maxLength: 5000 })} />
          <FieldError>{errors.comment ? "Please write a few words." : undefined}</FieldError>
          {serverError && <p className="mt-3 rounded-lg bg-negative-50 px-3 py-2 text-sm text-negative-700">{serverError}</p>}
          <Button type="submit" className="mt-4 w-full" loading={submitFeedback.isPending}>{t("employee.feedback.submit")}</Button>
        </form>
      </CardContent></Card>
    </div>
  );
}
