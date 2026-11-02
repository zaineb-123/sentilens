import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from "@/features/organization/hooks";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSkeleton, ErrorState, EmptyState } from "@/components/domain/States";
export default function AdminDepartmentsPage() {
  const { data, isLoading, isError, refetch } = useDepartments();
  const create = useCreateDepartment();
  const update = useUpdateDepartment();
  const remove = useDeleteDepartment();
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  if (isLoading) return <LoadingSkeleton rows={3} />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New department name" className="max-w-xs" />
        <Button disabled={!newName.trim()} loading={create.isPending} onClick={() => create.mutate(newName, { onSuccess: () => setNewName("") })}><Plus className="h-4 w-4" /> Add</Button>
      </div>
      {!data || data.length === 0 ? <EmptyState title="No departments yet" /> : (
        <Table>
          <Thead><Tr><Th>Name</Th><Th>Headcount</Th><Th>Actions</Th></Tr></Thead>
          <tbody>
            {data.map((d) => (
              <Tr key={d._id}>
                <Td>{editing === d._id ? <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8" autoFocus /> : d.name}</Td>
                <Td>{d.headcount}</Td>
                <Td>
                  <div className="flex gap-1">
                    {editing === d._id ? <Button size="sm" onClick={() => { update.mutate({ id: d._id, name: editName }); setEditing(null); }}>Save</Button> : <Button variant="ghost" size="sm" onClick={() => { setEditing(d._id); setEditName(d.name); }}><Pencil className="h-3.5 w-3.5" /></Button>}
                    <Button variant="ghost" size="sm" onClick={() => remove.mutate(d._id)}><Trash2 className="h-3.5 w-3.5 text-negative-500" /></Button>
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
