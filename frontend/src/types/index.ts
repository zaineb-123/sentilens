export type Role = "employee" | "hr" | "admin";
export type UserStatus = "invited" | "active" | "disabled";

export interface User {
  _id: string; email: string; role: Role; orgId: string; status: UserStatus;
  lastLoginAt: string | null; createdAt: string;
}

export interface LocalizedText { fr?: string; en?: string; ar?: string; }

export type QuestionType = "likert" | "single_choice" | "multi_choice" | "text";
export interface QuestionOption { key: string; label: LocalizedText; }
export interface Question {
  _id?: string; order: number; type: QuestionType; prompt: LocalizedText;
  options?: QuestionOption[]; required?: boolean; aspectHint?: string | null;
}

export type SurveyStatus = "draft" | "published" | "closed";
export interface Survey {
  _id: string; orgId: string; title: LocalizedText; description?: LocalizedText; status: SurveyStatus;
  targetDepartmentIds: string[]; opensAt: string | null; closesAt: string | null; createdBy: string;
  questions: Question[]; createdAt: string; updatedAt: string;
}

export interface Department { _id: string; orgId: string; name: string; headcount: number; }
export interface Organization {
  _id: string; name: string; slug: string;
  settings: { minGroupSize: number; allowAnonymousBox: boolean; showOrgResultsToEmployees: boolean; languages: string[]; retentionDays: number; };
}
export interface AuditLogEntry {
  _id: string; orgId: string; actorId: string; actorRole: Role; action: string; resource: string;
  resourceId: string | null; meta: Record<string, unknown>; outcome: "success" | "failure"; at: string;
}

export type Sentiment = "positive" | "neutral" | "negative" | "mixed";
export type Emotion = "joy" | "satisfaction" | "frustration" | "anger" | "sadness" | "fear" | "surprise" | "neutral";

export interface FeedbackSubmitResponse { receiptCode: string; feedbackId: string; }
export interface AnalysisResult {
  language: string | null;
  sentiment: { label: Sentiment; confidence: number | null; scores: { positive: number; neutral: number; negative: number } | null };
  emotions: { primary: Emotion | null; scores: { label: Emotion; score: number }[] };
  aspects: { key: string; label?: string | Record<string, string>; sentiment: Sentiment }[];
}
export interface ReceiptStatus { analysisStatus: "pending" | "processing" | "done" | "failed"; submittedAt: string; /** Only present once done: the AI result of the caller's own message. */ result?: AnalysisResult; }
export interface ExplorerFeedbackItem { comment: string; analysisStatus: string; day: string; source: "survey" | "anonymous_box" | "csv_import"; }

export interface PrivacySuppressed { suppressed: true; reason: string; minGroupSize: number; count?: number; }
export interface PrivacyVisible { suppressed: false; }
export type Privacy = PrivacySuppressed | PrivacyVisible;

export interface ExplorerResult { suppressed: boolean; reason?: string; minGroupSize?: number; count?: number; items: ExplorerFeedbackItem[]; }
export interface ImportBatch { _id: string; filename: string; status: "processing" | "done" | "failed"; total: number; valid: number; invalid: number; errors: { row: number; message: string }[]; }

export interface OverviewResult { privacy: Privacy; totalFeedback?: number; sentiment?: Record<Sentiment, number>; topAspects?: { key: string; mentions: number }[]; }
export interface SentimentBreakdown { privacy: Privacy; totalFeedback?: number; counts?: Record<Sentiment, number>; percentages?: Record<Sentiment, number>; }
export interface EmotionBreakdown { privacy: Privacy; totalFeedback?: number; counts?: Record<Emotion, number>; percentages?: Record<Emotion, number>; }
export interface AspectStat { key: string; mentions: number; sentiment: Record<Sentiment, number>; }
export interface AspectBreakdown { privacy: Privacy; aspects?: AspectStat[]; }
export interface TrendPoint { date: string; count: number; sentiment: Record<Sentiment, number>; }
export interface TrendsResult { privacy: Privacy; points?: TrendPoint[]; }
export interface DepartmentComparisonRow { departmentId: string; privacy: Privacy; totalFeedback?: number; sentiment?: Record<Sentiment, number>; }
export interface DepartmentComparisonResult { minGroupSize: number; departments: DepartmentComparisonRow[]; }

export type AlertSeverity = "info" | "warning" | "critical";
export type AlertStatus = "new" | "acknowledged" | "resolved";
export interface Alert {
  _id: string; orgId: string; departmentId: string | null; type: string; aspectKey: string;
  severity: AlertSeverity; metric: string; current: number; previous: number; changePct: number;
  period: { from: string; to: string }; sampleSize: number; status: AlertStatus; createdAt: string;
}

export interface NotificationItem { _id: string; type: "alert" | "import_batch_done" | "invitation" | "system"; refId: string | null; title: string; message: string; read: boolean; createdAt: string; }
export interface ServiceHealth { overall: "up" | "degraded"; services: Record<string, { status: "up" | "down"; latencyMs: number; error?: string }>; checkedAt: string; }
export interface ApiErrorBody { error: { code: string; message: string; details?: unknown }; }
