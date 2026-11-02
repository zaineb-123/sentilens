"use strict";
const mongoose = require("mongoose");

/** The final AI result for one feedback item. Denormalizes orgId/departmentId/day from the
 *  Feedback Service so Analytics can aggregate without cross-service joins on every query. */
const analysisSchema = new mongoose.Schema(
  {
    feedbackId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, index: true },
    orgId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    surveyId: { type: mongoose.Schema.Types.ObjectId, default: null },
    day: { type: Date, required: true },
    language: {
      code: String, script: String, confidence: Number,
      dialect: { type: String, default: null }, experimental: { type: Boolean, default: false },
    },
    sentiment: {
      label: { type: String, enum: ["positive", "neutral", "negative", "mixed"], required: true },
      confidence: Number,
      scores: { positive: Number, neutral: Number, negative: Number },
    },
    emotions: {
      primary: String,
      scores: [{ label: String, score: Number, _id: false }],
    },
    aspects: [{
      key: String, label: mongoose.Schema.Types.Mixed, type: { type: String, enum: ["fixed", "emergent"] },
      sentiment: { type: String, enum: ["positive", "neutral", "negative", "mixed"] },
      confidence: Number, mentions: Number, _id: false,
    }],
    engine: String,
    modelVersions: mongoose.Schema.Types.Mixed,
    processingMs: Number,
  },
  { timestamps: true },
);

analysisSchema.index({ orgId: 1, day: -1 });
analysisSchema.index({ orgId: 1, departmentId: 1, day: -1 });

module.exports = mongoose.model("Analysis", analysisSchema);
