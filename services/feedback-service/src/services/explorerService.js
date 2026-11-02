"use strict";
const Feedback = require("../models/Feedback");
const orgClient = require("./orgClient");

/** Fisher-Yates shuffle (never reveal submission order, which can correlate with identity). */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * HR feedback explorer. If a departmentId filter is given, the group must meet the org's
 * k-anonymity threshold or the comments are suppressed entirely (privacy by design).
 */
async function explore(orgId, filters) {
  const query = { orgId };
  if (filters.surveyId) query.surveyId = filters.surveyId;
  if (filters.departmentId) query.departmentId = filters.departmentId;
  if (filters.from || filters.to) {
    query.day = {};
    if (filters.from) query.day.$gte = new Date(filters.from);
    if (filters.to) query.day.$lte = new Date(filters.to);
  }

  if (filters.departmentId) {
    const [count, minGroupSize] = await Promise.all([
      Feedback.countDocuments(query),
      orgClient.getMinGroupSize(orgId),
    ]);
    if (count < minGroupSize) {
      return { suppressed: true, reason: "Not enough responses to protect anonymity.", minGroupSize, count, items: [] };
    }
  }

  const items = await Feedback.find(query)
    .select("comment analysisStatus day source")
    .sort({ _id: -1 })
    .limit(filters.limit || 20)
    .lean();

  return { suppressed: false, items: shuffle(items) };
}

module.exports = { explore };
