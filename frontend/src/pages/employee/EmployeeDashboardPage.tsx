import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ClipboardList, MessageSquareText, Bell, Inbox, ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { KpiCard } from "@/components/domain/KpiCard";
import { ParticipationRing } from "@/components/domain/ParticipationRing";
import { useAvailableSurveys, useMyParticipations } from "@/features/surveys/hooks";
import { useUnreadCount } from "@/features/notifications/hooks";
import { useReceiptHistory } from "@/features/feedback/receiptStore";
import { LoadingSkeleton } from "@/components/domain/States";

export default function EmployeeDashboardPage() {
  const { t, i18n } = useTranslation();
  const { data: surveys, isLoading } = useAvailableSurveys();
  const { data: participations } = useMyParticipations();
  const { data: unread } = useUnreadCount();
  const { items: saved } = useReceiptHistory();

  // The server lists every open survey for the employee, answered or not: cross it with their participations.
  const answered = new Set((participations ?? []).map((p) => String(p.surveyId)));
  const open = surveys ?? [];
  const pending = open.filter((s) => !answered.has(String(s._id)));
  const done = open.length - pending.length;
  const pct = open.length ? Math.round((done / open.length) * 100) : 0;
  const next = pending[0]; // the server sorts newest first
  const title = (s: { title: { fr?: string; en?: string } }) => s.title[i18n.language as "fr" | "en"] || s.title.fr || s.title.en || "";
  const closes = next?.closesAt ? new Date(next.closesAt).toLocaleDateString(i18n.language, { day: "numeric", month: "long" }) : null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="relative overflow-hidden lg:col-span-2">
          <div aria-hidden className="pointer-events-none absolute -end-16 -top-16 h-56 w-56 rounded-full bg-primary/25 blur-3xl" />
          <CardContent className="relative flex h-full flex-col justify-between gap-6 p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">{t("employee.v2.dash.next")}</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{next ? t("employee.v2.dash.nextSurvey", { title: title(next) }) : t("employee.v2.dash.nextFeedback")}</h2>
              <p className="mt-2 max-w-lg text-sm text-slate-500">{next ? t("employee.v2.dash.nextSurveySub") : t("employee.v2.dash.nextFeedbackSub")}{closes && <> · {t("employee.v2.dash.nextClose", { date: closes })}</>}</p>
            </div>
            <div>
              <Link to={next ? `/app/surveys/${next._id}` : "/app/feedback"} className="btn-glow group inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-primary to-mixed px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110">
                {t("employee.v2.dash.go")}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t("employee.v2.dash.participation")}</p>
            <ParticipationRing pct={pct}>
              {open.length ? <><span className="text-3xl font-extrabold tabular-nums text-slate-900">{pct}%</span><span className="text-[11px] text-slate-400">{done}/{open.length}</span></> : <span className="px-4 text-xs text-slate-400">—</span>}
            </ParticipationRing>
            <p className="text-sm text-slate-600">{open.length === 0 ? t("employee.v2.dash.participationNone") : pending.length === 0 ? t("employee.v2.dash.participationAll") : t("employee.v2.dash.participationOf", { done, total: open.length })}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link to="/app/surveys" className="block"><KpiCard label={t("employee.v2.dash.pending")} value={pending.length} icon={ClipboardList} tone="primary" /></Link>
        <Link to="/notifications" className="block"><KpiCard label={t("employee.v2.dash.notifications")} value={unread ?? 0} icon={Bell} tone={unread ? "warning" : "slate"} /></Link>
        <Link to="/app/my-feedback" className="block"><KpiCard label={t("employee.v2.dash.myFeedback")} value={saved.length} icon={Inbox} tone="positive" /></Link>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">{t("employee.dashboard.availableSurveys")}</h2>
        {isLoading ? <LoadingSkeleton rows={2} /> : open.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {open.map((s) => {
              const isDone = answered.has(String(s._id));
              const card = (
                <Card className={isDone ? "h-full opacity-70" : "h-full transition duration-200 hover:-translate-y-0.5 hover:border-primary-400/50"}>
                  <CardContent className="flex items-start justify-between gap-3">
                    <div><p className="font-medium text-slate-900">{title(s)}</p><p className="mt-1 text-xs text-slate-500">{s.questions.length} questions</p></div>
                    {isDone ? <Badge tone="positive"><CheckCircle2 className="h-3.5 w-3.5" />{t("employee.v2.dash.answered")}</Badge> : <Badge tone="primary"><Circle className="h-3 w-3" />{t("employee.v2.dash.todo")}</Badge>}
                  </CardContent>
                </Card>
              );
              return isDone ? <div key={s._id}>{card}</div> : <Link key={s._id} to={`/app/surveys/${s._id}`}>{card}</Link>;
            })}
          </div>
        ) : <p className="text-sm text-slate-500">{t("employee.surveys.empty")}</p>}
      </div>

      <Link to="/app/feedback" className="block">
        <Card className="transition duration-200 hover:-translate-y-0.5 hover:border-primary-400/50"><CardContent className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-mixed-50 text-mixed-600"><MessageSquareText className="h-5 w-5" /></div>
          <p className="flex-1 text-sm font-medium text-slate-800">{t("employee.feedback.anonymousTitle")}</p><ArrowRight className="h-4 w-4 text-slate-400 rtl:rotate-180" />
        </CardContent></Card>
      </Link>
    </div>
  );
}
