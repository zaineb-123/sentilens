import { useTranslation } from "react-i18next";
import { useState } from "react";
import { MessageSquareText, Smile, Users, ClipboardList, AlertTriangle } from "lucide-react";
import { KpiCard } from "@/components/domain/KpiCard";
import { KpiSkeleton, ErrorState } from "@/components/domain/States";
import { PrivacyGate } from "@/components/domain/PrivacyGate";
import { AnalyticsFilterBar, type AnalyticsFilterState } from "@/components/domain/AnalyticsFilterBar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { useOverview, useTrends } from "@/features/analytics/hooks";
import { useHrSurveys as useSurveysForKpi } from "@/features/surveys/hooks";
import { useAlerts } from "@/features/analytics/hooks";
import { SentimentPieChart } from "@/components/charts/SentimentPieChart";
import { SentimentTrendChart } from "@/components/charts/SentimentTrendChart";
import { TopAspectsList } from "@/components/charts/AspectLists";
import { AlertCard } from "@/components/domain/AlertCard";
import { Link } from "react-router-dom";

export default function HrDashboardPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<AnalyticsFilterState>({});
  const { data: overview, isLoading, isError, refetch } = useOverview(filters);
  const { data: trends } = useTrends(filters);
  const { data: activeSurveys } = useSurveysForKpi("published");
  const { data: alerts } = useAlerts("new");

  return (
    <div className="space-y-6">
      <AnalyticsFilterBar value={filters} onChange={setFilters} />
      {isLoading ? <KpiSkeleton /> : isError || !overview ? <ErrorState onRetry={() => refetch()} /> : (
        <PrivacyGate privacy={overview.privacy}>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <KpiCard label={t("hr.kpi.total")} value={overview.totalFeedback ?? 0} icon={MessageSquareText} tone="primary" />
            <KpiCard label={t("hr.kpi.positive")} value={overview.sentiment?.positive ?? 0} suffix="%" icon={Smile} tone="positive" />
            <KpiCard label={t("hr.kpi.participation")} value="—" icon={Users} tone="slate" />
            <KpiCard label={t("hr.kpi.activeSurveys")} value={activeSurveys?.length ?? 0} icon={ClipboardList} tone="primary" />
            <KpiCard label={t("hr.kpi.alerts")} value={alerts?.length ?? 0} icon={AlertTriangle} tone="warning" />
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Sentiment evolution</CardTitle></CardHeader>
              <CardContent>{trends?.privacy.suppressed === false && trends.points ? <SentimentTrendChart points={trends.points} /> : <p className="py-10 text-center text-sm text-slate-400">{t("common.noResults")}</p>}</CardContent>
            </Card>
            <Card><CardHeader><CardTitle>Sentiment distribution</CardTitle></CardHeader><CardContent><SentimentPieChart percentages={overview.sentiment!} /></CardContent></Card>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Top workplace topics</CardTitle></CardHeader>
              <CardContent>{overview.topAspects && overview.topAspects.length > 0 ? <TopAspectsList aspects={overview.topAspects} /> : <p className="py-6 text-center text-sm text-slate-400">{t("common.noResults")}</p>}</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>{t("hr.kpi.alerts")}</CardTitle><Link to="/hr/alerts" className="text-xs font-medium text-primary-600 hover:underline">{t("common.viewAll")}</Link></CardHeader>
              <CardContent className="space-y-3">{alerts && alerts.length > 0 ? alerts.slice(0, 3).map((a) => <AlertCard key={a._id} alert={a} />) : <p className="py-6 text-center text-sm text-slate-400">{t("common.noResults")}</p>}</CardContent>
            </Card>
          </div>
        </PrivacyGate>
      )}
    </div>
  );
}
