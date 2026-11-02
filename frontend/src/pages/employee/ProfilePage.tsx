import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth/AuthContext";
import { useDepartments, useMyProfile, useUpdateMyProfile } from "@/features/organization/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Select, SelectItem } from "@/components/ui/Select";
import { Label } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { LoadingSkeleton } from "@/components/domain/States";
import { setLanguage, type SupportedLanguage } from "@/i18n";
export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { data: profile, isLoading } = useMyProfile();
  const { data: departments } = useDepartments();
  const updateProfile = useUpdateMyProfile();
  const { push } = useToast();
  if (isLoading) return <LoadingSkeleton rows={3} />;
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <Card>
        <CardHeader><CardTitle>{t("nav.profile")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>{t("auth.email")}</Label><p className="text-sm text-slate-700">{user?.email}</p></div>
          <div>
            <Label>{t("common.department")}</Label>
            <Select value={profile?.departmentId ?? undefined} onValueChange={(v) => updateProfile.mutate({ departmentId: v }, { onSuccess: () => push({ tone: "success", title: "Saved" }) })}>
              {departments?.map((d) => <SelectItem key={d._id} value={d._id}>{d.name}</SelectItem>)}
            </Select>
            <p className="mt-1 text-xs text-slate-400">Only you can see this — it is used to route department-targeted surveys to you.</p>
          </div>
          <div>
            <Label>Language</Label>
            <Select value={i18n.language} onValueChange={(v) => { setLanguage(v as SupportedLanguage); updateProfile.mutate({ locale: v }); }}>
              <SelectItem value="fr">Français</SelectItem><SelectItem value="en">English</SelectItem><SelectItem value="ar">العربية</SelectItem>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
