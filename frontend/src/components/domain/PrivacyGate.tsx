import type { Privacy } from "@/types";
import { PrivacyNotice } from "./PrivacyNotice";
import type { ReactNode } from "react";
export function PrivacyGate({ privacy, minGroupSizeFallback = 5, children }: { privacy: Privacy; minGroupSizeFallback?: number; children: ReactNode }) {
  if (privacy.suppressed) return <PrivacyNotice minGroupSize={privacy.minGroupSize ?? minGroupSizeFallback} count={privacy.count} />;
  return <>{children}</>;
}
