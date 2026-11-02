"use strict";
const mongoose = require("mongoose");

/** One row per feedback item ever seen by this service. Tracks attempts/locking/errors so
 *  a temporarily-down AI service leads to retries, not lost feedback (see docs/ai.md). */
const jobSchema = new mongoose.Schema(
  {
    feedbackId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, index: true },
    orgId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    status: { type: String, enum: ["pending", "processing", "done", "failed"], default: "pending", index: true },
    attempts: { type: Number, default: 0 },
    lastError: { type: String, default: null },
    lockedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Job", jobSchema);
