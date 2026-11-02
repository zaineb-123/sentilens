import { useParams, Link } from "react-router-dom";
import { useSurvey, useSurveyParticipation } from "@/features/surveys/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LoadingSkeleton, ErrorState } from "@/components/domain/States";
import { Users, Search } from "lucide-react";
export default function SurveyResultsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: survey, isLoading, isError, refetch } = useSurvey(id);
  const { data: participation } = useSurveyParticipation(id);
  if (isLoading) return <LoadingSkeleton rows={3} />;
  if (isError || !survey) return <ErrorState onRetry={() => refetch()} />;
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card>
        <CardHeader><CardTitle>{survey.title.fr || survey.title.en}</CardTitle><Badge tone="slate" className="capitalize">{survey.status}</Badge></CardHeader>
        <CardContent className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600"><Users className="h-5 w-5" /></div>
          <div><p className="text-xs text-slate-500">Total participants</p><p className="text-xl font-semibold">{participation?.totalParticipants ?? "—"}</p></div>
        </CardContent>
      </Card>
      <p className="text-sm text-slate-500">
        Individual answers are anonymous and not linkable to participants. To review the content of responses, use the{" "}
        <Link to={`/hr/feedback?surveyId=${survey._id}`} className="inline-flex items-center gap-1 font-medium text-primary-600 hover:underline"><Search className="h-3.5 w-3.5" /> Feedback Explorer</Link>{" "}filtered to this survey.
      </p>
    </div>
  );
}
