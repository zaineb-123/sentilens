"use strict";
function required(name, fallback) {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error("missing required env var " + name);
  return v;
}
module.exports = {
  port: parseInt(process.env.PORT || "4005", 10),
  mongoUri: required("MONGO_URI", "mongodb://localhost:27017/analysis_db"),
  internalKey: process.env.INTERNAL_SERVICE_KEY || "",
  feedbackServiceUrl: process.env.FEEDBACK_SERVICE_URL || "http://feedback-service:4004",
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://ai-service:8000",
  aiInternalKey: process.env.AI_INTERNAL_KEY || "",
  analyticsServiceUrl: process.env.ANALYTICS_SERVICE_URL || "",
  pollBatchSize: parseInt(process.env.POLL_BATCH_SIZE || "10", 10),
  pollIntervalMs: parseInt(process.env.POLL_INTERVAL_MS || "5000", 10),
  maxAttempts: parseInt(process.env.MAX_ATTEMPTS || "5", 10),
};
