"use strict";
const mongoose = require("mongoose");

const importBatchSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    filename: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, required: true }, // the HR user who imported (audit only, not linked to any feedback)
    status: { type: String, enum: ["processing", "done", "failed"], default: "processing" },
    total: { type: Number, default: 0 },
    valid: { type: Number, default: 0 },
    invalid: { type: Number, default: 0 },
    errors: { type: [{ row: Number, message: String, _id: false }], default: [] },
  },
  { timestamps: true, suppressReservedKeysWarning: true },
);

module.exports = mongoose.model("ImportBatch", importBatchSchema);
