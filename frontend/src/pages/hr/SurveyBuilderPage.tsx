import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Label } from "@/components/ui/Input";
import { Select, SelectItem } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { useSurvey, useCreateSurvey, useUpdateSurvey } from "@/features/surveys/hooks";
import { useToast } from "@/components/ui/Toast";
import { apiErrorMessage } from "@/lib/apiClient";
import { LoadingSkeleton } from "@/components/domain/States";
import type { Question, QuestionType } from "@/types";
import { cn } from "@/lib/cn";

type DraftQuestion = Question & { localId: string };
const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "likert", label: "Likert (1–5)" }, { value: "single_choice", label: "Single choice" },
  { value: "multi_choice", label: "Multiple choice" }, { value: "text", label: "Free text" },
];
function newQuestion(order: number): DraftQuestion { return { localId: crypto.randomUUID(), order, type: "likert", prompt: { fr: "", en: "" }, required: true }; }

export default function SurveyBuilderPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { push } = useToast();
  const { data: existing, isLoading } = useSurvey(id);
  const createSurvey = useCreateSurvey();
  const updateSurvey = useUpdateSurvey();
  const [titleFr, setTitleFr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [questions, setQuestions] = useState<DraftQuestion[]>([newQuestion(0)]);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (existing) {
      setTitleFr(existing.title.fr ?? ""); setTitleEn(existing.title.en ?? "");
      setQuestions(existing.questions.map((q) => ({ ...q, localId: q._id || crypto.randomUUID() })));
    }
  }, [existing]);

  const addQuestion = () => setQuestions((qs) => [...qs, newQuestion(qs.length)]);
  const removeQuestion = (localId: string) => setQuestions((qs) => qs.filter((q) => q.localId !== localId).map((q, i) => ({ ...q, order: i })));
  const updateQuestion = (localId: string, patch: Partial<DraftQuestion>) => setQuestions((qs) => qs.map((q) => (q.localId === localId ? { ...q, ...patch } : q)));
  const move = (index: number, dir: -1 | 1) => {
    setQuestions((qs) => { const next = [...qs]; const target = index + dir; if (target < 0 || target >= next.length) return qs; [next[index], next[target]] = [next[target], next[index]]; return next.map((q, i) => ({ ...q, order: i })); });
  };
  const buildPayload = () => ({ title: { fr: titleFr, en: titleEn }, questions: questions.map(({ localId, _id, ...q }) => q) });
  const saveDraft = async () => {
    try {
      if (isEdit) { await updateSurvey.mutateAsync({ id: id!, payload: buildPayload() }); push({ tone: "success", title: "Saved" }); }
      else { const survey = await createSurvey.mutateAsync(buildPayload()); push({ tone: "success", title: "Draft created" }); navigate(`/hr/surveys/${survey._id}/edit`, { replace: true }); }
    } catch (e) { push({ tone: "error", title: "Could not save", description: apiErrorMessage(e) }); }
  };

  if (isEdit && isLoading) return <LoadingSkeleton rows={4} />;
  if (isEdit && existing && existing.status !== "draft") return <p className="text-sm text-slate-500">Only draft surveys can be edited. This survey is {existing.status}.</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">{t("hr.builder.title")}</h1>
        <Button variant="outline" size="sm" onClick={() => setPreview((p) => !p)}>{preview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {t("hr.builder.preview")}</Button>
      </div>
      <Card><CardContent className="space-y-3">
        <div><Label>Title (French)</Label><Input value={titleFr} onChange={(e) => setTitleFr(e.target.value)} placeholder="Sondage trimestriel…" /></div>
        <div><Label>Title (English)</Label><Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder="Quarterly pulse survey…" /></div>
      </CardContent></Card>
      {questions.map((q, i) => (
        <Card key={q.localId}>
          <CardHeader>
            <div className="flex items-center gap-2"><GripVertical className="h-4 w-4 text-slate-300" /><CardTitle>Question {i + 1}</CardTitle></div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" disabled={i === 0} onClick={() => move(i, -1)}>↑</Button>
              <Button variant="ghost" size="sm" disabled={i === questions.length - 1} onClick={() => move(i, 1)}>↓</Button>
              <Button variant="ghost" size="sm" onClick={() => removeQuestion(q.localId)}><Trash2 className="h-4 w-4 text-negative-500" /></Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {preview ? (
              <div><p className="text-sm font-medium text-slate-800">{q.prompt.fr || q.prompt.en || <span className="italic text-slate-400">(empty)</span>}</p><Badge tone="slate" className="mt-1 capitalize">{q.type.replace("_", " ")}</Badge></div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label>Type</Label>
                    <Select value={q.type} onValueChange={(v) => updateQuestion(q.localId, { type: v as QuestionType, options: v === "single_choice" || v === "multi_choice" ? [{ key: "opt1", label: { fr: "" } }, { key: "opt2", label: { fr: "" } }] : undefined })}>
                      {QUESTION_TYPES.map((qt) => <SelectItem key={qt.value} value={qt.value}>{qt.label}</SelectItem>)}
                    </Select>
                  </div>
                  <div className="flex items-end gap-2 pb-1"><label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={q.required !== false} onChange={(e) => updateQuestion(q.localId, { required: e.target.checked })} />{t("common.required")}</label></div>
                </div>
                <div><Label>Prompt (French)</Label><Textarea rows={2} value={q.prompt.fr ?? ""} onChange={(e) => updateQuestion(q.localId, { prompt: { ...q.prompt, fr: e.target.value } })} /></div>
                <div><Label>Prompt (English)</Label><Textarea rows={2} value={q.prompt.en ?? ""} onChange={(e) => updateQuestion(q.localId, { prompt: { ...q.prompt, en: e.target.value } })} /></div>
                {(q.type === "single_choice" || q.type === "multi_choice") && (
                  <div className="space-y-2">
                    <Label>Options</Label>
                    {(q.options ?? []).map((opt, oi) => (
                      <div key={opt.key} className="flex items-center gap-2">
                        <Input value={opt.label.fr ?? ""} onChange={(e) => { const next = [...(q.options ?? [])]; next[oi] = { ...opt, label: { ...opt.label, fr: e.target.value } }; updateQuestion(q.localId, { options: next }); }} placeholder={`Option ${oi + 1}`} />
                        <Button variant="ghost" size="sm" onClick={() => updateQuestion(q.localId, { options: (q.options ?? []).filter((_, x) => x !== oi) })}><Trash2 className="h-3.5 w-3.5 text-negative-500" /></Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => updateQuestion(q.localId, { options: [...(q.options ?? []), { key: `opt${(q.options?.length ?? 0) + 1}`, label: { fr: "" } }] })}><Plus className="h-3.5 w-3.5" /> Add option</Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" onClick={addQuestion} className="w-full"><Plus className="h-4 w-4" /> {t("hr.builder.addQuestion")}</Button>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={() => navigate("/hr/surveys")}>{t("common.cancel")}</Button>
        <Button onClick={saveDraft} loading={createSurvey.isPending || updateSurvey.isPending}>{t("hr.builder.saveDraft")}</Button>
      </div>
    </div>
  );
}
