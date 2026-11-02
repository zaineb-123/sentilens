"use strict";
const mongoose = require("mongoose");

/**
 * Deliberately minimal: no name, phone, or birthdate (data minimisation, see docs/privacy.md).
 * userId links back to the Auth Service; this collection never holds credentials.
 */
const employeeProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, index: true },
    orgId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
    locale: { type: String, enum: ["fr", "en", "ar"], default: "fr" },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

module.exports = mongoose.model("EmployeeProfile", employeeProfileSchema);
