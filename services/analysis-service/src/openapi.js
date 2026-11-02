"use strict";
module.exports = {
  openapi: "3.0.3",
  info: { title: "SentiLens Analysis Service", version: "1.0.0", description: "MongoDB-backed async job queue connecting Feedback Service to the AI Service. Internal only - not exposed by the API Gateway." },
  paths: {
    "/internal/jobs": { post: { summary: "Latency hint: process one job immediately (internal)" } },
    "/internal/run-once": { post: { summary: "Manually trigger one polling cycle (internal/ops)" } },
    "/internal/analyses/{feedbackId}": { get: { summary: "Get the stored analysis for one feedback item (internal)" } },
    "/internal/jobs/{feedbackId}": { get: { summary: "Get job status/attempts for one feedback item (internal)" } },
  },
};
