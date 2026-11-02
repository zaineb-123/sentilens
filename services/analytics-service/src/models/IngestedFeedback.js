"use strict";
const mongoose = require("mongoose");

/** Dedup marker: ensures /internal/ingest is idempotent even if the Analysis Service retries
 *  a push (e.g. after a network timeout where the first ingest actually succeeded). */
const ingestedFeedbackSchema = new mongoose.Schema(
  { feedbackId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true } },
  { timestamps: true },
);

module.exports = mongoose.model("IngestedFeedback", ingestedFeedbackSchema);
