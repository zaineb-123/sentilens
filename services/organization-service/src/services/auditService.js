"use strict";
const AuditLog = require("../models/AuditLog");

/** Fire-and-forget by design: a logging failure must never break the action being audited. */
async function record({ orgId, actorId, actorRole, action, resource, resourceId = null, meta = {}, outcome = "success" }) {
  try {
    await AuditLog.create({ orgId, actorId, actorRole, action, resource, resourceId, meta, outcome });
  } catch (err) {
    console.error("audit log write failed", { action, resource, err: err.message });
  }
}

module.exports = { record };
