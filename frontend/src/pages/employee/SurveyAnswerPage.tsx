import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useForm, Controller } from "react-hook-form";
import { useAvailableSurvey } from "@/features/surveys/hooks";
import { useSubmitFeedback } from "@/features/feedback/hooks";
import { Button } from "@/components/ui/Button";
import { Textarea, Label } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";
import { LoadingSkeleton, ErrorState } from "@/components/domain/States";
import { apiErrorMessage } from "@/lib/apiClient";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { Question } from "@/types";
import { cn } from "@/lib/cn";

type FormValues = Record<string, string | string[]>;

function LikertField({ value, onChange }: { question: Question; value?: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(String(n))} className={cn("flex h-10 flex-1 items-center justify-center rounded-xl border text-sm font-medium transition-colors", value === String(n) ? "border-primary bg-primary text-white" : "border-border bg-white text-slate-600 hover:bg-slate-50")}>{n}</button>
      ))}
    </div>
  );
}
function ChoiceField({ question, multi, value, onChange }: { question: Question; multi: boolean; value?: string | string[]; onChange: (v: string | string[]) => void }) {
  const selected = new Set(Array.isArray(value) ? value : value ? [value] : []);
  const toggle = (key: string) => {
    if (multi) { const next = new Set(selected); next.has(key) ? next.delete(key) : next.add(key); onChange(Array.from(next)); }
    else onChange(key);
  };
  return (
    <div className="space-y-2">
      {question.options?.map((opt) => (
        <button key={opt.key} type="button" onClick={() => toggle(opt.key)} className={cn("flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition-colors", selected.has(opt.key) ? "border-primary bg-primary-50 text-primary-700" : "border-border bg-white text-slate-700 hover:bg-slate-50")}>
          <span className={cn("flex h-4 w-4 items-center justify-center rounded border", multi ? "rounded-sm" : "rounded-full", selected.has(opt.key) ? "border-primary bg-primary" : "border-slate-300")} />
          {opt.label.fr || opt.label.en}
        </button>
      ))}
    </div>
  );
}

export default function SurveyAnswerPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: survey, isLoading, isError, refetch } = useAvailableSurvey(id);
  const submitFeedback = useSubmitFeedback();
  const [serverError, setServerError] = useState<string | null>(null);
  const { control, register, handleSubmit } = useForm<FormValues>();

  if (isLoading) return <LoadingSkeleton rows={4} />;
  if (isError || !survey) return <ErrorState onRetry={() => refetch()} />;

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    const answers = survey.questions.map((q) => ({ questionId: q._id!, value: values[q._id!] }));
    try { const result = await submitFeedback.mutateAsync({ surveyId: survey._id, answers }); navigate("/app/feedback/success", { state: { receiptCode: result.receiptCode } }); }
    catch (e) { setServerError(apiErrorMessage(e)); }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/app/surveys" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"><ArrowLeft className="h-4 w-4" /> {t("common.back")}</Link>
      <h1 className="mb-1 text-lg font-semibold text-slate-900">{survey.title.fr || survey.title.en}</h1>
      {survey.description?.fr && <p className="mb-6 text-sm text-slate-500">{survey.description.fr}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {survey.questions.sort((a, b) => a.order - b.order).map((q) => (
          <Card key={q._id}>
            <CardContent>
              <Label className="mb-3">{q.prompt.fr || q.prompt.en}{q.required !== false && <span className="text-negative-500"> *</span>}</Label>
              {q.type === "likert" && <Controller name={q._id!} control={control} rules={{ required: q.required !== false }} render={({ field }) => <LikertField question={q} value={field.value as string} onChange={field.onChange} />} />}
              {(q.type === "single_choice" || q.type === "multi_choice") && <Controller name={q._id!} control={control} rules={{ required: q.required !== false }} render={({ field }) => <ChoiceField question={q} multi={q.type === "multi_choice"} value={field.value} onChange={field.onChange} />} />}
              {q.type === "text" && <Textarea rows={3} {...register(q._id!, { required: q.required !== false })} />}
            </CardContent>
          </Card>
        ))}
        {serverError && <p className="rounded-lg bg-negative-50 px-3 py-2 text-sm text-negative-700">{serverError}</p>}
        <Button type="submit" className="w-full" loading={submitFeedback.isPending}>{t("common.submit")}</Button>
      </form>
    </div>
  );
}
