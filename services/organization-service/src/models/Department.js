"use strict";
const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true, trim: true },
    headcount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);
departmentSchema.index({ orgId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Department", departmentSchema);
