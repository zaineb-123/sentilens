"use strict";
const { upstreamUnavailable, ApiError } = require("@sentilens/shared");

const SURVEY_SERVICE_URL = process.env.SURVEY_SERVICE_URL || "http://survey-service:4003";
const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY || "";

/** Asks the Survey Service to validate the survey is live and record participation.
 *  Throws a client-facing error (survey not found/closed, already participated, etc.)
 *  or upstreamUnavailable if the Survey Service cannot be reached at all. */
async function checkAndRecordParticipation({ orgId, userId, departmentId, surveyId }) {
  let res;
  try {
    res = await fetch(`${SURVEY_SERVICE_URL}/internal/participation/check-and-record`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Internal-Key": INTERNAL_KEY },
      body: JSON.stringify({ orgId, userId, departmentId, surveyId }),
    });
  } catch (e) {
    throw upstreamUnavailable("survey-service is unreachable");
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = body.error || {};
    throw new ApiError(res.status, err.code || "SURVEY_SERVICE_ERROR", err.message || "survey validation failed");
  }
  return body;
}

module.exports = { checkAndRecordParticipation };
