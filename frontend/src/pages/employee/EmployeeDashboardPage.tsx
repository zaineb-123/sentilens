import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ClipboardList, MessageSquareText, History, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { useAvailableSurveys, useMyParticipations } from "@/features/surveys/hooks";
import { LoadingSkeleton } from "@/components/domain/States";

export default function EmployeeDashboardPage() {
  const { t } = useTranslation();
  const { data: surveys, isLoading: surveysLoading } = useAvailableSurveys();
  const { data: participations } = useMyParticipations();
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><CardContent className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600"><ClipboardList className="h-5 w-5" /></div>
          <div><p className="text-xs text-slate-500">{t("employee.dashboard.availableSurveys")}</p><p className="text-xl font-semibold">{surveys?.length ?? "—"}</p></div>
        </CardContent></Card>
        <Card><CardContent className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-positive-50 text-positive-600"><History className="h-5 w-5" /></div>
          <div><p className="text-xs text-slate-500">{t("employee.dashboard.participation")}</p><p className="text-xl font-semibold">{participations?.length ?? "—"}</p></div>
        </CardContent></Card>
        <Link to="/app/feedback">
          <Card className="h-full transition-shadow hover:shadow-md"><CardContent className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-mixed-50 text-mixed-600"><MessageSquareText className="h-5 w-5" /></div>
            <div className="flex-1"><p className="text-sm font-medium text-slate-800">{t("employee.feedback.anonymousTitle")}</p></div>
            <ArrowRight className="h-4 w-4 text-slate-400" />
          </CardContent></Card>
        </Link>
      </div>
      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">{t("employee.dashboard.availableSurveys")}</h2>
        {surveysLoading ? <LoadingSkeleton rows={2} /> : surveys && surveys.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {surveys.map((s) => (
              <Link key={s._id} to={`/app/surveys/${s._id}`}>
                <Card className="h-full transition-shadow hover:shadow-md"><CardContent><p className="font-medium text-slate-900">{s.title.fr || s.title.en}</p><p className="mt-1 text-xs text-slate-500">{s.questions.length} questions</p></CardContent></Card>
              </Link>
            ))}
          </div>
        ) : <p className="text-sm text-slate-500">{t("employee.surveys.empty")}</p>}
      </div>
    </div>
  );
}
