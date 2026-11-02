"use strict";
const Job = require("../models/Job");
const Analysis = require("../models/Analysis");
const feedbackClient = require("./feedbackClient");
const aiClient = require("./aiClient");
const analyticsClient = require("./analyticsClient");
const env = require("../config/env");

/** Maps one AI /analyze response onto the Analysis document shape. */
function toAnalysisDoc(feedbackItem, ai) {
  return {
    feedbackId: feedbackItem._id, orgId: feedbackItem.orgId, departmentId: feedbackItem.departmentId,
    surveyId: feedbackItem.surveyId, day: feedbackItem.day,
    language: ai.language, sentiment: ai.sentiment, emotions: ai.emotions, aspects: ai.aspects,
    engine: ai.meta.engine, modelVersions: ai.meta.models, processingMs: ai.meta.processing_ms,
  };
}

/** Processes exactly one claimed feedback item end to end. Never throws: failures are
 *  recorded on the Job and reflected back to the Feedback Service so nothing is silently lost. */
async function processOne(feedbackItem) {
  const job = await Job.findOneAndUpdate(
    { feedbackId: feedbackItem._id },
    { $setOnInsert: { orgId: feedbackItem.orgId }, $set: { status: "processing", lockedAt: new Date() }, $inc: { attempts: 1 } },
    { upsert: true, new: true },
  );

  try {
    const ai = await aiClient.analyze(feedbackItem.comment || "");
    const doc = await Analysis.findOneAndUpdate(
      { feedbackId: feedbackItem._id }, toAnalysisDoc(feedbackItem, ai), { upsert: true, new: true },
    );
    job.status = "done";
    job.lastError = null;
    await job.save();
    await feedbackClient.reportStatus(feedbackItem._id, "done");
    analyticsClient.ingest(doc).catch(() => {}); // best-effort; see analyticsClient.js
    return { ok: true };
  } catch (err) {
    const exhausted = job.attempts >= env.maxAttempts;
    job.status = exhausted ? "failed" : "pending";
    job.lastError = String(err.message || err);
    await job.save();
    await feedbackClient.reportStatus(feedbackItem._id, job.status).catch(() => {});
    return { ok: false, error: job.lastError, exhausted };
  }
}

/** Claims a batch of pending feedback from the Feedback Service and processes it sequentially
 *  (the AI service itself serializes CPU inference, so no benefit to parallelizing here). */
async function runOnce(limit = env.pollBatchSize) {
  const items = await feedbackClient.claimPending(limit);
  const results = [];
  for (const item of items) {
    results.push(await processOne(item)); // eslint-disable-line no-await-in-loop
  }
  return { claimed: items.length, results };
}

module.exports = { processOne, runOnce, toAnalysisDoc };
