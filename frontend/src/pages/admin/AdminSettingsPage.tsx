import { useOrganizations, useUpdateOrgSettings } from "@/features/organization/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Label, Input } from "@/components/ui/Input";
import { LoadingSkeleton, ErrorState, EmptyState } from "@/components/domain/States";
import { useToast } from "@/components/ui/Toast";
export default function AdminSettingsPage() {
  const { data, isLoading, isError, refetch } = useOrganizations();
  const updateSettings = useUpdateOrgSettings();
  const { push } = useToast();
  const org = data?.[0];
  if (isLoading) return <LoadingSkeleton rows={3} />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!org) return <EmptyState title="No organization yet" description="Create one under Organizations first." />;
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Card>
        <CardHeader><CardTitle>Privacy settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Minimum group size (k-anonymity threshold)</Label>
            <Input type="number" min={3} defaultValue={org.settings.minGroupSize} onBlur={(e) => { const v = Number(e.target.value); if (v >= 3) updateSettings.mutate({ id: org._id, settings: { minGroupSize: v } }, { onSuccess: () => push({ tone: "success", title: "Saved" }) }); }} />
            <p className="mt-1 text-xs text-slate-400">Detailed statistics for a group below this size are never shown.</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" defaultChecked={org.settings.allowAnonymousBox} onChange={(e) => updateSettings.mutate({ id: org._id, settings: { allowAnonymousBox: e.target.checked } })} />Allow the anonymous feedback box (outside of surveys)</label>
          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" defaultChecked={org.settings.showOrgResultsToEmployees} onChange={(e) => updateSettings.mutate({ id: org._id, settings: { showOrgResultsToEmployees: e.target.checked } })} />Show org-wide results to employees</label>
        </CardContent>
      </Card>
    </div>
  );
}
