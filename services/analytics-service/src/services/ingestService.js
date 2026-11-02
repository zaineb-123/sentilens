"use strict";
const DailyStat = require("../models/DailyStat");
const IngestedFeedback = require("../models/IngestedFeedback");

/** Builds the $inc operator for one analysis result: +1 on its sentiment label, +1 on its
 *  primary emotion, and per-aspect mention/sentiment counters. */
function buildIncrements(analysis) {
  const inc = { count: 1, [`sentiment.${analysis.sentiment.label}`]: 1 };
  if (analysis.emotions?.primary) inc[`emotions.${analysis.emotions.primary}`] = 1;
  for (const aspect of analysis.aspects || []) {
    inc[`aspects.${aspect.key}.mentions`] = 1;
    inc[`aspects.${aspect.key}.${aspect.sentiment}`] = 1;
  }
  return inc;
}

async function upsertRollup(orgId, departmentId, date, inc) {
  await DailyStat.findOneAndUpdate(
    { orgId, departmentId, date },
    { $inc: inc, $setOnInsert: { orgId, departmentId, date } },
    { upsert: true },
  );
}

/**
 * Idempotent ingest of one analysis result into the org-wide AND (if present) the
 * department-specific daily rollup. Safe to call more than once for the same feedbackId -
 * the second call is a no-op (see IngestedFeedback).
 */
async function ingest(analysis) {
  try {
    await IngestedFeedback.create({ feedbackId: analysis.feedbackId });
  } catch (e) {
    if (e.code === 11000) return { alreadyIngested: true }; // duplicate push - do not double count
    throw e;
  }

  const inc = buildIncrements(analysis);
  await upsertRollup(analysis.orgId, null, analysis.day, inc); // org-wide
  if (analysis.departmentId) {
    await upsertRollup(analysis.orgId, analysis.departmentId, analysis.day, inc);
  }
  return { alreadyIngested: false };
}

module.exports = { ingest, buildIncrements };
