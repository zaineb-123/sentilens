"use strict";

function escapeCsvCell(value) {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function rowsToCsv(rows) {
  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n") + (rows.length ? "\r\n" : "");
}

/** Builds a CSV from overview + aspect data already fetched by the caller. */
function buildReportCsv(overview, aspectData) {
  const rows = [
    ["metric", "value"],
    ["total_feedback", overview.totalFeedback ?? ""],
    ["positive_pct", overview.sentiment?.positive ?? ""],
    ["neutral_pct", overview.sentiment?.neutral ?? ""],
    ["negative_pct", overview.sentiment?.negative ?? ""],
    ["mixed_pct", overview.sentiment?.mixed ?? ""],
    [],
    ["aspect", "mentions", "positive_pct", "neutral_pct", "negative_pct", "mixed_pct"],
    ...((aspectData.aspects || []).map((a) => [a.key, a.mentions, a.sentiment.positive, a.sentiment.neutral, a.sentiment.negative, a.sentiment.mixed])),
  ];
  return rowsToCsv(rows);
}

module.exports = { buildReportCsv, rowsToCsv };
