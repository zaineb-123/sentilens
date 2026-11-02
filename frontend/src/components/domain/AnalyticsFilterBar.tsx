import { Select, SelectItem } from "@/components/ui/Select";
import { Input, Label } from "@/components/ui/Input";
import { useDepartments } from "@/features/organization/hooks";
import { useTranslation } from "react-i18next";
export interface AnalyticsFilterState { departmentId?: string; from?: string; to?: string; }
export function AnalyticsFilterBar({ value, onChange }: { value: AnalyticsFilterState; onChange: (v: AnalyticsFilterState) => void }) {
  const { t } = useTranslation();
  const { data: departments } = useDepartments();
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[180px]">
        <Label>{t("common.department")}</Label>
        <Select value={value.departmentId ?? "all"} onValueChange={(v) => onChange({ ...value, departmentId: v === "all" ? undefined : v })}>
          <SelectItem value="all">{t("common.viewAll")}</SelectItem>
          {departments?.map((d) => <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>)}
        </Select>
      </div>
      <div><Label>{t("common.from")}</Label><Input type="date" value={value.from?.slice(0, 10) ?? ""} onChange={(e) => onChange({ ...value, from: e.target.value ? `${e.target.value}T00:00:00.000Z` : undefined })} /></div>
      <div><Label>{t("common.to")}</Label><Input type="date" value={value.to?.slice(0, 10) ?? ""} onChange={(e) => onChange({ ...value, to: e.target.value ? `${e.target.value}T23:59:59.999Z` : undefined })} /></div>
    </div>
  );
}
