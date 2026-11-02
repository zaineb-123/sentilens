"use strict";
const env = require("../config/env");

/** Best-effort: notifies HR that a new trend alert was created. Does not resolve recipients
 *  itself (that's an Organization Service concern, not yet wired here) - orgId-wide
 *  notification recipient targeting is a documented next step (see docs/notifications.md). */
async function notifyNewAlert(alert, recipientUserId) {
  if (!env.notificationServiceUrl || !recipientUserId) return;
  await fetch(`${env.notificationServiceUrl}/internal/notifications`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Internal-Key": env.internalKey },
    body: JSON.stringify({
      orgId: alert.orgId, recipientUserId, type: "alert", refId: String(alert._id),
      title: `${alert.aspectKey}: negative mentions up ${alert.changePct}pp`,
      message: `${alert.sampleSize} responses analyzed over the last period.`,
    }),
  });
}

module.exports = { notifyNewAlert };
