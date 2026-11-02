import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Plus, Pencil, Users, Play, Square } from "lucide-react";
import { useHrSurveys, usePublishSurvey, useCloseSurvey } from "@/features/surveys/hooks";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { LoadingSkeleton, ErrorState, EmptyState } from "@/components/domain/States";
import { useToast } from "@/components/ui/Toast";
import { apiErrorMessage } from "@/lib/apiClient";
const STATUS_TONE = { draft: "slate", published: "positive", closed: "negative" } as const;
export default function SurveyManagementPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useHrSurveys();
  const publish = usePublishSurvey();
  const close = useCloseSurvey();
  const { push } = useToast();
  if (isLoading) return <LoadingSkeleton rows={4} />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Link to="/hr/surveys/new"><Button><Plus className="h-4 w-4" /> {t("hr.surveys.create")}</Button></Link></div>
      {!data || data.length === 0 ? <EmptyState title={t("common.noResults")} /> : (
        <Table>
          <Thead><Tr><Th>Title</Th><Th>{t("common.status")}</Th><Th>Questions</Th><Th>{t("common.actions")}</Th></Tr></Thead>
          <tbody>
            {data.map((s) => (
              <Tr key={s._id}>
                <Td className="font-medium">{s.title.fr || s.title.en}</Td>
                <Td><Badge tone={STATUS_TONE[s.status]} className="capitalize">{s.status}</Badge></Td>
                <Td>{s.questions.length}</Td>
                <Td>
                  <div className="flex items-center gap-1">
                    {s.status === "draft" && <Link to={`/hr/surveys/${s._id}/edit`}><Button variant="ghost" size="sm"><Pencil className="h-3.5 w-3.5" /></Button></Link>}
                    {s.status === "draft" && <Button variant="ghost" size="sm" onClick={() => publish.mutate(s._id, { onError: (e) => push({ tone: "error", title: "Could not publish", description: apiErrorMessage(e) }) })}><Play className="h-3.5 w-3.5" /></Button>}
                    {s.status === "published" && <Button variant="ghost" size="sm" onClick={() => close.mutate(s._id)}><Square className="h-3.5 w-3.5" /></Button>}
                    <Link to={`/hr/surveys/${s._id}/results`}><Button variant="ghost" size="sm"><Users className="h-3.5 w-3.5" /></Button></Link>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
