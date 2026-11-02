"use strict";
const mongoose = require("mongoose");

const localizedText = {
  fr: { type: String, default: "" },
  en: { type: String, default: "" },
  ar: { type: String, default: "" },
};

/** Questions are embedded: they only ever exist as part of one survey, and are always
 *  read/written together with it (no independent lifecycle -> no separate collection). */
const questionSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ["likert", "single_choice", "multi_choice", "text"], required: true },
    prompt: { type: localizedText, required: true },
    options: {
      type: [{ key: { type: String, required: true }, label: localizedText }],
      default: undefined, // only meaningful for single_choice/multi_choice
    },
    required: { type: Boolean, default: true },
    aspectHint: { type: String, default: null }, // optional link to a fixed aspect key (e.g. "workload")
  },
  { _id: true },
);

const surveySchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    title: { type: localizedText, required: true },
    description: { type: localizedText, default: () => ({}) },
    status: { type: String, enum: ["draft", "published", "closed"], default: "draft", index: true },
    targetDepartmentIds: { type: [mongoose.Schema.Types.ObjectId], default: [] }, // empty = whole org
    opensAt: { type: Date, default: null },
    closesAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
    questions: { type: [questionSchema], default: [], validate: (arr) => arr.length <= 50 },
  },
  { timestamps: true },
);

surveySchema.index({ orgId: 1, status: 1, closesAt: 1 });

// Choice questions must carry options; other types must not (data integrity beyond what
// Mongoose enum/required alone can express).
surveySchema.path("questions").validate(function (questions) {
  return questions.every((q) => {
    const needsOptions = q.type === "single_choice" || q.type === "multi_choice";
    return needsOptions ? Array.isArray(q.options) && q.options.length >= 2 : !q.options || q.options.length === 0;
  });
}, "single_choice/multi_choice questions need >=2 options; other types must not define options");

module.exports = mongoose.model("Survey", surveySchema);
