"use strict";
const env = require("../config/env");

/** Talks to the Feedback Service's internal queue endpoints (see feedback-service/src/routes/internalRoutes.js). */
async function claimPending(limit) {
  const res = await fetch(`${env.feedbackServiceUrl}/internal/feedback/pending?limit=${limit}`, {
    headers: { "X-Internal-Key": env.internalKey },
  });
  if (!res.ok) throw new Error(`feedback-service pending claim failed: ${res.status}`);
  return (await res.json()).items;
}

async function reportStatus(feedbackId, status) {
  const res = await fetch(`${env.feedbackServiceUrl}/internal/feedback/${feedbackId}/analysis-status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "X-Internal-Key": env.internalKey },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`feedback-service status update failed: ${res.status}`);
}

module.exports = { claimPending, reportStatus };
