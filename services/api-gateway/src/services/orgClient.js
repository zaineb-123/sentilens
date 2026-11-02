"use strict";
const env = require("../config/env");

/** Resolves an employee's departmentId so the gateway can inject X-Department-Id before
 *  proxying to Survey/Feedback - those services trust the header completely and never
 *  re-derive it themselves (single source of truth: the employee's profile). */
async function getEmployeeDepartmentId(userId) {
  const res = await fetch(`${env.services.organization}/internal/employee-profiles/${userId}`, {
    headers: { "X-Internal-Key": process.env.INTERNAL_SERVICE_KEY || "" },
  });
  if (!res.ok) return null; // best-effort: treat as "no department" rather than failing the request
  const body = await res.json();
  return body.profile?.departmentId || null;
}

module.exports = { getEmployeeDepartmentId };
