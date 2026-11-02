"use strict";
const mongoose = require("mongoose");

/**
 * PRIVACY-CRITICAL SCHEMA. This collection must NEVER contain: userId, IP address, or
 * user-agent. Participation ("who answered survey X") lives only in the Survey Service,
 * in a separate database, with no reference back to this collection - see docs/privacy.md.
 */
const feedbackSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    surveyId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    source: { type: String, enum: ["survey", "anonymous_box", "csv_import"], required: true },
    batchId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    answers: {
      type: [{ questionId: String, value: mongoose.Schema.Types.Mixed, _id: false }],
      default: [],
    },
    comment: { type: String, default: "", maxlength: 5000 }, // PII-masked before it ever reaches here
    receiptHash: { type: String, required: true, unique: true },
    analysisStatus: { type: String, enum: ["pending", "processing", "done", "failed"], default: "pending", index: true },
    lockedAt: { type: Date, default: null }, // claimed by an Analysis Service worker; released on failure
    day: { type: Date, required: true }, // submission time rounded down to the day (privacy: no exact timestamps)
  },
  { timestamps: true },
);

feedbackSchema.index({ orgId: 1, surveyId: 1 });
feedbackSchema.index({ orgId: 1, departmentId: 1, day: 1 });

module.exports = mongoose.model("Feedback", feedbackSchema);
