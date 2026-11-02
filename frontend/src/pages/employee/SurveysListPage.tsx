import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAvailableSurveys } from "@/features/surveys/hooks";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState, LoadingSkeleton, ErrorState } from "@/components/domain/States";
import { ClipboardList } from "lucide-react";
export default function SurveysListPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError, refetch } = useAvailableSurveys();
  if (isLoading) return <LoadingSkeleton rows={4} />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!data || data.length === 0) return <EmptyState title={t("employee.surveys.empty")} />;
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((s) => (
        <Link key={s._id} to={`/app/surveys/${s._id}`}>
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardContent>
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600"><ClipboardList className="h-4.5 w-4.5" /></div>
              <p className="font-medium text-slate-900">{s.title.fr || s.title.en}</p>
              {s.description?.fr && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{s.description.fr}</p>}
              <p className="mt-2 text-xs text-slate-400">{s.questions.length} questions</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
