import { useAuditLogs } from "@/features/organization/hooks";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { LoadingSkeleton, ErrorState, EmptyState } from "@/components/domain/States";
export default function AdminAuditLogsPage() {
  const { data, isLoading, isError, refetch } = useAuditLogs();
  if (isLoading) return <LoadingSkeleton rows={5} />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (!data || data.logs.length === 0) return <EmptyState title="No audit events yet" />;
  return (
    <Table>
      <Thead><Tr><Th>Action</Th><Th>Resource</Th><Th>Actor role</Th><Th>Outcome</Th><Th>When</Th></Tr></Thead>
      <tbody>
        {data.logs.map((log) => (
          <Tr key={log._id}>
            <Td className="font-mono text-xs">{log.action}</Td><Td>{log.resource}{log.resourceId ? ` (${log.resourceId.slice(-6)})` : ""}</Td>
            <Td><Badge tone="primary" className="capitalize">{log.actorRole}</Badge></Td><Td><Badge tone={log.outcome === "success" ? "positive" : "negative"}>{log.outcome}</Badge></Td>
            <Td className="text-xs text-slate-500">{new Date(log.at).toLocaleString()}</Td>
          </Tr>
        ))}
      </tbody>
    </Table>
  );
}
