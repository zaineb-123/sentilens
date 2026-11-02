import { useTranslation } from "react-i18next";
import { useMyParticipations } from "@/features/surveys/hooks";
import { EmptyState, LoadingSkeleton, ErrorState } from "@/components/domain/States";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { CheckCircle2 } from "lucide-react";
export default function ParticipationHistoryPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useMyParticipations();
  if (isLoading) return <LoadingSkeleton rows={4} />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!data || data.length === 0) return <EmptyState title={t("employee.history.empty")} />;
  return (
    <Table>
      <Thead><Tr><Th>Survey</Th><Th>{t("common.status")}</Th><Th>{t("common.day")}</Th></Tr></Thead>
      <tbody>{data.map((p) => (<Tr key={p.surveyId}><Td className="font-mono text-xs">{p.surveyId}</Td><Td><span className="inline-flex items-center gap-1 text-positive-600"><CheckCircle2 className="h-3.5 w-3.5" /> Answered</span></Td><Td>{new Date(p.at).toLocaleDateString()}</Td></Tr>))}</tbody>
    </Table>
  );
}
