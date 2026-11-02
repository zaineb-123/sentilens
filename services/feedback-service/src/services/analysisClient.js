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

module.exports = { enqueue };
