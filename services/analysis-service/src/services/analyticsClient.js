"use strict";
const env = require("../config/env");

/** Best-effort push to the Analytics Service after each successful analysis. If Analytics
 *  is down, the Analysis record still exists here and a future reconciliation job in
 *  Analytics (documented, not yet built) can re-ingest from this service - see docs/analytics.md. */
async function ingest(analysisDoc) {
  if (!env.analyticsServiceUrl) return;
  await fetch(`${env.analyticsServiceUrl}/internal/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Internal-Key": env.internalKey },
    body: JSON.stringify(analysisDoc),
  });
}

module.exports = { ingest };
