"use strict";
const env = require("../config/env");

/** Resolves which users should be notified about org-wide HR alerts. */
async function listHrUserIds(orgId) {
  const res = await fetch(`${env.authServiceUrl}/internal/users?orgId=${orgId}&role=hr`, {
    headers: { "X-Internal-Key": env.internalKey },
  });
  if (!res.ok) throw new Error("auth-service user lookup failed");
  return (await res.json()).userIds;
}

module.exports = { listHrUserIds };
