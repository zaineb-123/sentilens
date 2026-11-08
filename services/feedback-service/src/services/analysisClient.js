"use strict";

const ANALYSIS_SERVICE_URL = process.env.ANALYSIS_SERVICE_URL || "";
const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY || "";

/**
 * Best-effort: asks the Analysis Service to enqueue a job for this feedback. If the
 * Analysis Service is unreachable or not configured, the feedback still exists with
 * analysisStatus "pending" - the Analysis Service is expected to also poll
 * GET /internal/feedback/pending on this service, so nothing is lost (see docs/ai.md).
 */
async function enqueue(feedbackDoc) {
  if (!ANALYSIS_SERVICE_URL) return;
  await fetch(`${ANALYSIS_SERVICE_URL}/internal/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Internal-Key": INTERNAL_KEY },
    body: JSON.stringify({
      feedbackId: feedbackDoc._id, orgId: feedbackDoc.orgId, departmentId: feedbackDoc.departmentId,
      surveyId: feedbackDoc.surveyId, text: feedbackDoc.comment, day: feedbackDoc.day,
    }),
  });
}

/**
 * Fetches the finished analysis of ONE feedback item so its author can see it via their receipt code.
 * Returns only the fields the employee needs (never feedbackId/orgId/departmentId) and null on any
 * failure, so a slow or unreachable Analysis Service can never break the receipt-status endpoint.
 */
async function getResult(feedbackId) {
  if (!ANALYSIS_SERVICE_URL) return null;
  try {
    const res = await fetch(`${ANALYSIS_SERVICE_URL}/internal/analyses/${encodeURIComponent(String(feedbackId))}`, {
      headers: { "X-Internal-Key": INTERNAL_KEY },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const { analysis: a } = await res.json();
    if (!a || !a.sentiment) return null;
    return {
      language: a.language?.code || null,
      sentiment: { label: a.sentiment.label, confidence: a.sentiment.confidence ?? null, scores: a.sentiment.scores || null },
      emotions: { primary: a.emotions?.primary || null, scores: (a.emotions?.scores || []).slice(0, 5).map(({ label, score }) => ({ label, score })) },
      aspects: (a.aspects || []).slice(0, 8).map(({ key, label, sentiment }) => ({ key, label, sentiment })),
    };
  } catch {
    return null;
  }
}

module.exports = { enqueue, getResult };
