"use strict";
const DailyStat = require("../models/DailyStat");
const orgClient = require("./orgClient");

const SENTIMENT_LABELS = ["positive", "neutral", "negative", "mixed"];
const EMOTION_LABELS = ["joy", "satisfaction", "frustration", "anger", "sadness", "fear", "surprise", "neutral"];

function dateFilter(from, to) {
  const f = {};
  if (from) f.$gte = new Date(from);
  if (to) f.$lte = new Date(to);
  return Object.keys(f).length ? f : undefined;
}

function pct(n, total) {
  return total > 0 ? Math.round((n / total) * 1000) / 10 : 0; // one decimal place
}

/** Sums a set of DailyStat rows into one totals object (count + sentiment + emotions + aspects). */
function sumRows(rows) {
  const totals = { count: 0, sentiment: Object.fromEntries(SENTIMENT_LABELS.map((l) => [l, 0])), emotions: Object.fromEntries(EMOTION_LABELS.map((l) => [l, 0])), aspects: {} };
  for (const row of rows) {
    totals.count += row.count;
    for (const l of SENTIMENT_LABELS) totals.sentiment[l] += row.sentiment?.[l] || 0;
    for (const l of EMOTION_LABELS) totals.emotions[l] += row.emotions?.[l] || 0;
    const aspects = row.aspects instanceof Map ? row.aspects : new Map(Object.entries(row.aspects || {}));
    for (const [key, v] of aspects.entries()) {
      const a = totals.aspects[key] || { mentions: 0, positive: 0, neutral: 0, negative: 0, mixed: 0 };
      a.mentions += v.mentions || 0;
      a.positive += v.positive || 0; a.neutral += v.neutral || 0; a.negative += v.negative || 0; a.mixed += v.mixed || 0;
      totals.aspects[key] = a;
    }
  }
  return totals;
}

async function rowsFor(orgId, departmentId, filters) {
  const query = { orgId, departmentId: departmentId || null };
  const df = dateFilter(filters.from, filters.to);
  if (df) query.date = df;
  return DailyStat.find(query).sort({ date: 1 }).lean();
}

/** Applies the k-anonymity threshold when a department filter is present. Returns
 *  { suppressed: true, ... } instead of real numbers when the group is too small. */
async function checkThreshold(orgId, departmentId, rows) {
  if (!departmentId) return null;
  const count = rows.reduce((s, r) => s + r.count, 0);
  const minGroupSize = await orgClient.getMinGroupSize(orgId);
  if (count < minGroupSize) {
    return { suppressed: true, reason: "Not enough responses to protect anonymity.", minGroupSize, count };
  }
  return null;
}

async function overview(orgId, filters) {
  const rows = await rowsFor(orgId, filters.departmentId, filters);
  const suppression = await checkThreshold(orgId, filters.departmentId, rows);
  if (suppression) return { privacy: suppression };

  const totals = sumRows(rows);
  const topAspects = Object.entries(totals.aspects)
    .sort((a, b) => b[1].mentions - a[1].mentions).slice(0, 5)
    .map(([key, v]) => ({ key, mentions: v.mentions }));

  return {
    privacy: { suppressed: false },
    totalFeedback: totals.count,
    sentiment: Object.fromEntries(SENTIMENT_LABELS.map((l) => [l, pct(totals.sentiment[l], totals.count)])),
    topAspects,
  };
}

async function sentimentBreakdown(orgId, filters) {
  const rows = await rowsFor(orgId, filters.departmentId, filters);
  const suppression = await checkThreshold(orgId, filters.departmentId, rows);
  if (suppression) return { privacy: suppression };
  const totals = sumRows(rows);
  return { privacy: { suppressed: false }, totalFeedback: totals.count, counts: totals.sentiment, percentages: Object.fromEntries(SENTIMENT_LABELS.map((l) => [l, pct(totals.sentiment[l], totals.count)])) };
}

async function emotionBreakdown(orgId, filters) {
  const rows = await rowsFor(orgId, filters.departmentId, filters);
  const suppression = await checkThreshold(orgId, filters.departmentId, rows);
  if (suppression) return { privacy: suppression };
  const totals = sumRows(rows);
  return { privacy: { suppressed: false }, totalFeedback: totals.count, counts: totals.emotions, percentages: Object.fromEntries(EMOTION_LABELS.map((l) => [l, pct(totals.emotions[l], totals.count)])) };
}

async function aspectBreakdown(orgId, filters) {
  const rows = await rowsFor(orgId, filters.departmentId, filters);
  const suppression = await checkThreshold(orgId, filters.departmentId, rows);
  if (suppression) return { privacy: suppression };
  const totals = sumRows(rows);
  const aspects = Object.entries(totals.aspects)
    .sort((a, b) => b[1].mentions - a[1].mentions)
    .map(([key, v]) => ({
      key, mentions: v.mentions,
      sentiment: { positive: pct(v.positive, v.mentions), neutral: pct(v.neutral, v.mentions), negative: pct(v.negative, v.mentions), mixed: pct(v.mixed, v.mentions) },
    }));
  return { privacy: { suppressed: false }, aspects };
}

async function trendSeries(orgId, filters) {
  const rows = await rowsFor(orgId, filters.departmentId, filters);
  const suppression = await checkThreshold(orgId, filters.departmentId, rows);
  if (suppression) return { privacy: suppression };
  const points = rows.map((r) => ({
    date: r.date, count: r.count,
    sentiment: Object.fromEntries(SENTIMENT_LABELS.map((l) => [l, pct(r.sentiment?.[l] || 0, r.count)])),
  }));
  return { privacy: { suppressed: false }, points };
}

/**
 * Per-department comparison with COMPLEMENTARY SUPPRESSION: if exactly one department is
 * below the threshold while at least one other is not, the next-smallest visible department
 * is also suppressed - otherwise (total - visible others) would reveal the hidden group's
 * value by subtraction (see docs/privacy.md).
 */
async function departmentComparison(orgId, filters, departmentIds) {
  const minGroupSize = await orgClient.getMinGroupSize(orgId);
  const perDept = [];
  for (const departmentId of departmentIds) {
    const rows = await rowsFor(orgId, departmentId, filters); // eslint-disable-line no-await-in-loop
    const totals = sumRows(rows);
    perDept.push({ departmentId, count: totals.count, totals });
  }

  const belowThreshold = perDept.filter((d) => d.count < minGroupSize);
  const visible = perDept.filter((d) => d.count >= minGroupSize).sort((a, b) => a.count - b.count);
  if (belowThreshold.length === 1 && visible.length > 0) {
    belowThreshold.push(visible[0]); // suppress the next-smallest visible group too
  }
  const suppressedIds = new Set(belowThreshold.map((d) => d.departmentId));

  return {
    minGroupSize,
    departments: perDept.map((d) => {
      if (suppressedIds.has(d.departmentId)) {
        return { departmentId: d.departmentId, privacy: { suppressed: true, reason: "Not enough responses to protect anonymity.", minGroupSize } };
      }
      return {
        departmentId: d.departmentId, privacy: { suppressed: false }, totalFeedback: d.count,
        sentiment: Object.fromEntries(SENTIMENT_LABELS.map((l) => [l, pct(d.totals.sentiment[l], d.count)])),
      };
    }),
  };
}

module.exports = { overview, sentimentBreakdown, emotionBreakdown, aspectBreakdown, trendSeries, departmentComparison, sumRows, pct };
