"use strict";
const mongoose = require("mongoose");

/** Append-only. Never contains feedback text or answers - only administrative actions. */
const auditLogSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    actorRole: { type: String, enum: ["employee", "hr", "admin"], required: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: { type: String, default: null },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    outcome: { type: String, enum: ["success", "failure"], default: "success" },
    at: { type: Date, default: Date.now },
  },
  { timestamps: false },
);
auditLogSchema.index({ orgId: 1, at: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
