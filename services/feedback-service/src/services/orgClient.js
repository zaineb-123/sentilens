"use strict";
const ORG_SERVICE_URL = process.env.ORGANIZATION_SERVICE_URL || "http://organization-service:4002";
const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY || "";

/** Resolves department names to ids via the Organization Service (the owner of that data). */
async function resolveDepartmentIds(orgId, names) {
  if (names.length === 0) return {};
  const url = `${ORG_SERVICE_URL}/internal/departments/resolve?orgId=${encodeURIComponent(orgId)}&names=${encodeURIComponent(names.join(","))}`;
  const res = await fetch(url, { headers: { "X-Internal-Key": INTERNAL_KEY } });
  if (!res.ok) throw new Error("organization-service department resolution failed");
  const body = await res.json();
  return body.map;
}

async function getMinGroupSize(orgId) {
  const res = await fetch(`${ORG_SERVICE_URL}/internal/organizations/${orgId}/min-group-size`, { headers: { "X-Internal-Key": INTERNAL_KEY } });
  if (!res.ok) throw new Error("organization-service min-group-size lookup failed");
  return (await res.json()).minGroupSize;
}

module.exports = { resolveDepartmentIds, getMinGroupSize };
