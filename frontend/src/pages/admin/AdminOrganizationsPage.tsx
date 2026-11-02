import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import { useOrganizations, useCreateOrganization, useUpdateOrgSettings } from "@/features/organization/hooks";
import { Table, Thead, Tr, Th, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/Dialog";
import { LoadingSkeleton, ErrorState } from "@/components/domain/States";
import { useToast } from "@/components/ui/Toast";
import { apiErrorMessage } from "@/lib/apiClient";
interface CreateOrgForm { name: string; slug: string }
export default function AdminOrganizationsPage() {
  const { data, isLoading, isError, refetch } = useOrganizations();
  const createOrg = useCreateOrganization();
  const updateSettings = useUpdateOrgSettings();
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<CreateOrgForm>();
  const onCreate = async (values: CreateOrgForm) => {
    try { await createOrg.mutateAsync(values); reset(); setOpen(false); }
    catch (e) { push({ tone: "error", title: "Could not create organization", description: apiErrorMessage(e) }); }
  };
  if (isLoading) return <LoadingSkeleton rows={3} />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> New organization</Button></DialogTrigger>
          <DialogContent title="New organization">
            <form onSubmit={handleSubmit(onCreate)} className="space-y-3">
              <div><Label>Name</Label><Input {...register("name", { required: true })} /></div>
              <div><Label>Slug</Label><Input {...register("slug", { required: true, pattern: /^[a-z0-9-]+$/ })} placeholder="acme-corp" /></div>
              <Button type="submit" className="w-full" loading={createOrg.isPending}>Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <Thead><Tr><Th>Name</Th><Th>Slug</Th><Th>Min group size</Th><Th>Languages</Th></Tr></Thead>
        <tbody>
          {data?.map((org) => (
            <Tr key={org._id}>
              <Td className="font-medium">{org.name}</Td><Td className="font-mono text-xs">{org.slug}</Td>
              <Td><Input type="number" defaultValue={org.settings.minGroupSize} className="h-8 w-20" min={3} onBlur={(e) => { const v = Number(e.target.value); if (v !== org.settings.minGroupSize && v >= 3) updateSettings.mutate({ id: org._id, settings: { minGroupSize: v } }); }} /></Td>
              <Td>{org.settings.languages.join(", ")}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
