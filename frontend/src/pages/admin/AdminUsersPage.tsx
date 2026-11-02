import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Plus, Copy } from "lucide-react";
import { useAdminUsers, useInviteUser, useUpdateUserStatus } from "@/features/admin/hooks";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/Dialog";
import { Input, Label } from "@/components/ui/Input";
import { Select, SelectItem } from "@/components/ui/Select";
import { LoadingSkeleton, ErrorState } from "@/components/domain/States";
import { useToast } from "@/components/ui/Toast";
import { apiErrorMessage } from "@/lib/apiClient";
import type { Role, UserStatus } from "@/types";
const STATUS_TONE: Record<UserStatus, "slate" | "positive" | "negative"> = { invited: "slate", active: "positive", disabled: "negative" };
interface InviteForm { email: string; role: Role }
export default function AdminUsersPage() {
  const { data, isLoading, isError, refetch } = useAdminUsers();
  const invite = useInviteUser();
  const updateStatus = useUpdateUserStatus();
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [lastCode, setLastCode] = useState<string | null>(null);
  const { register, handleSubmit, reset, control } = useForm<InviteForm>({ defaultValues: { role: "employee" } });
  const onInvite = async (values: InviteForm) => {
    try { const result = await invite.mutateAsync(values); setLastCode(result.invitationCode); reset(); }
    catch (e) { push({ tone: "error", title: "Could not invite", description: apiErrorMessage(e) }); }
  };
  if (isLoading) return <LoadingSkeleton rows={4} />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setLastCode(null); }}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Invite user</Button></DialogTrigger>
          <DialogContent title="Invite user">
            {lastCode ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-600">Invitation created. Share this code with the invitee (it is shown only once):</p>
                <div className="flex items-center gap-2"><code className="flex-1 rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm">{lastCode}</code><Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(lastCode)}><Copy className="h-3.5 w-3.5" /></Button></div>
                <Button className="w-full" onClick={() => setOpen(false)}>Done</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onInvite)} className="space-y-3">
                <div><Label>Email</Label><Input type="email" {...register("email", { required: true })} /></div>
                <div>
                  <Label>Role</Label>
                  <Controller name="role" control={control} render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectItem value="employee">Employee</SelectItem><SelectItem value="hr">HR</SelectItem><SelectItem value="admin">Admin</SelectItem>
                    </Select>
                  )} />
                </div>
                <Button type="submit" className="w-full" loading={invite.isPending}>Send invitation</Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <Thead><Tr><Th>Email</Th><Th>Role</Th><Th>Status</Th><Th>Actions</Th></Tr></Thead>
        <tbody>
          {data?.map((u) => (
            <Tr key={u._id}>
              <Td>{u.email}</Td><Td><Badge tone="primary" className="capitalize">{u.role}</Badge></Td><Td><Badge tone={STATUS_TONE[u.status]} className="capitalize">{u.status}</Badge></Td>
              <Td>{u.status === "active" ? <Button variant="ghost" size="sm" onClick={() => updateStatus.mutate({ id: u._id, status: "disabled" })}>Disable</Button> : u.status === "disabled" ? <Button variant="ghost" size="sm" onClick={() => updateStatus.mutate({ id: u._id, status: "active" })}>Enable</Button> : null}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
