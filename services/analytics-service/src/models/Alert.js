"use strict";
const mongoose = require("mongoose");

/**
 * Describes a DETECTED TREND only - never a claimed cause (see docs/analytics.md and the
 * project's non-negotiable rule against diagnosing why something changed).
 */
const alertSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, default: null },
    type: { type: String, enum: ["aspect_negative_trend"], required: true },
    aspectKey: { type: String, required: true },
    aspectLabel: { type: mongoose.Schema.Types.Mixed, default: null },
    severity: { type: String, enum: ["info", "warning", "critical"], default: "warning" },
    metric: { type: String, default: "negative_share" },
    current: { type: Number, required: true },
    previous: { type: Number, required: true },
    changePct: { type: Number, required: true },
    period: { from: Date, to: Date, previousFrom: Date, previousTo: Date },
    sampleSize: { type: Number, required: true },
    status: { type: String, enum: ["new", "acknowledged", "resolved"], default: "new", index: true },
  },
  { timestamps: true },
);

alertSchema.index({ orgId: 1, status: 1, createdAt: -1 });
// One live alert per (org, department, aspect) at a time - re-detection updates it in place
// instead of spamming duplicates every polling cycle.
alertSchema.index({ orgId: 1, departmentId: 1, aspectKey: 1, status: 1 });

module.exports = mongoose.model("Alert", alertSchema);
