"use strict";
const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    settings: {
      minGroupSize: { type: Number, default: 5, min: 3 }, // k-anonymity threshold; never below 3
      allowAnonymousBox: { type: Boolean, default: true }, // free-form feedback outside of surveys
      showOrgResultsToEmployees: { type: Boolean, default: false },
      languages: { type: [String], default: ["fr", "en"] },
      retentionDays: { type: Number, default: 730 },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Organization", organizationSchema);
