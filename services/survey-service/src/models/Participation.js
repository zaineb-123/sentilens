"use strict";
const mongoose = require("mongoose");

/**
 * Deliberately holds ONLY "user X answered survey Y at time T" - never the feedbackId, and
 * never the answers themselves. This is what lets an employee check they participated while
 * keeping their answers unlinkable from Feedback Service data (see docs/privacy.md).
 */
const participationSchema = new mongoose.Schema(
  {
    surveyId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    at: { type: Date, default: Date.now },
  },
  { timestamps: false },
);
participationSchema.index({ surveyId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Participation", participationSchema);
