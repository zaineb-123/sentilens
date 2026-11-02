import { useState } from "react";
import { AnalyticsFilterBar, type AnalyticsFilterState } from "@/components/domain/AnalyticsFilterBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { useDepartmentComparison } from "@/features/analytics/hooks";
import { useDepartments } from "@/features/organization/hooks";
import { LoadingSkeleton, ErrorState, EmptyState } from "@/components/domain/States";
import { PrivacyNotice } from "@/components/domain/PrivacyNotice";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import type { Sentiment } from "@/types";
export default function DepartmentComparisonPage() {
  const [filters, setFilters] = useState<AnalyticsFilterState>({});
  const { data: departments } = useDepartments();
  const departmentIds = (departments ?? []).map((d) => d._id);
  const { data, isLoading, isError, refetch } = useDepartmentComparison(filters, departmentIds);
  const nameById = Object.fromEntries((departments ?? []).map((d) => [d._id, d.name]));
  if (!departments || departments.length === 0) return <EmptyState title="No departments yet" />;
  return (
    <div className="space-y-6">
      <AnalyticsFilterBar value={filters} onChange={setFilters} />
      {isLoading ? <LoadingSkeleton rows={3} /> : isError || !data ? <ErrorState onRetry={() => refetch()} /> : (
        <Card>
          <CardHeader><CardTitle>Department comparison</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <Thead><Tr><Th>Department</Th><Th>Total</Th><Th>Positive</Th><Th>Neutral</Th><Th>Negative</Th><Th>Mixed</Th></Tr></Thead>
              <tbody>
                {data.departments.map((row) => (
                  <Tr key={row.departmentId}>
                    <Td className="font-medium">{nameById[row.departmentId] ?? row.departmentId}</Td>
                    {row.privacy.suppressed ? <Td colSpan={5}><span className="text-xs text-slate-400">Suppressed — fewer than {row.privacy.minGroupSize} responses</span></Td> : (<>
                      <Td>{row.totalFeedback}</Td>
                      {(["positive", "neutral", "negative", "mixed"] as Sentiment[]).map((k) => <Td key={k}>{row.sentiment![k]}%</Td>)}
                    </>)}
                  </Tr>
                ))}
              </tbody>
            </Table>
            {data.departments.some((d) => d.privacy.suppressed) && <div className="mt-4"><PrivacyNotice minGroupSize={data.minGroupSize} /></div>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
