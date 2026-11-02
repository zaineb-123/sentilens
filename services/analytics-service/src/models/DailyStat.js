"use strict";
const mongoose = require("mongoose");

const sentimentCounts = { positive: { type: Number, default: 0 }, neutral: { type: Number, default: 0 }, negative: { type: Number, default: 0 }, mixed: { type: Number, default: 0 } };
const emotionCounts = { joy: { type: Number, default: 0 }, satisfaction: { type: Number, default: 0 }, frustration: { type: Number, default: 0 }, anger: { type: Number, default: 0 }, sadness: { type: Number, default: 0 }, fear: { type: Number, default: 0 }, surprise: { type: Number, default: 0 }, neutral: { type: Number, default: 0 } };

const aspectCountSchema = new mongoose.Schema(
  { mentions: { type: Number, default: 0 }, positive: { type: Number, default: 0 }, neutral: { type: Number, default: 0 }, negative: { type: Number, default: 0 }, mixed: { type: Number, default: 0 } },
  { _id: false },
);

/**
 * Pre-aggregated per (org, department-or-null-for-org-wide, day) rollup - the whole point of
 * this collection is that dashboards read a handful of rows instead of scanning raw analyses.
 * `departmentId: null` rows are the org-wide totals, updated alongside the department-specific
 * ones on every ingest (see ingestService.js).
 */
const dailyStatSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    date: { type: Date, required: true },
    count: { type: Number, default: 0 },
    sentiment: { type: sentimentCounts, default: () => ({}) },
    emotions: { type: emotionCounts, default: () => ({}) },
    aspects: { type: Map, of: aspectCountSchema, default: () => new Map() },
  },
  { timestamps: true },
);

dailyStatSchema.index({ orgId: 1, departmentId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("DailyStat", dailyStatSchema);
