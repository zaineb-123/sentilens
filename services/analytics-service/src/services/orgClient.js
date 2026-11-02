"use strict";
const env = require("../config/env");

async function getMinGroupSize(orgId) {
  const res = await fetch(`${env.organizationServiceUrl}/internal/organizations/${orgId}/min-group-size`, {
    headers: { "X-Internal-Key": env.internalKey },
  });
  if (!res.ok) throw new Error("organization-service min-group-size lookup failed");
  return (await res.json()).minGroupSize;
}

module.exports = { getMinGroupSize };
