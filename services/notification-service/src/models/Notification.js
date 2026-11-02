"use strict";
const mongoose = require("mongoose");

/**
 * In-app notifications for HR/admin users only (employees are anonymous to the org and never
 * have a notification feed - there is nothing to notify them about that would not risk
 * re-identifying them). type + refId let the frontend link back to the source (an alert, an
 * import batch, an invitation, etc.) without this service needing to know each domain's shape.
 */
const notificationSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    recipientUserId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    type: { type: String, enum: ["alert", "import_batch_done", "invitation", "system"], required: true },
    refId: { type: String, default: null },
    title: { type: String, required: true, maxlength: 200 },
    message: { type: String, default: "", maxlength: 1000 },
    read: { type: Boolean, default: false, index: true },
    emailSentAt: { type: Date, default: null },
  },
  { timestamps: true },
);

notificationSchema.index({ recipientUserId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
