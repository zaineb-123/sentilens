"use strict";
const env = require("../config/env");

/** Wraps the AI Service's POST /analyze. Any non-2xx or network failure surfaces as a
 *  thrown error so the caller can mark the job for retry (see worker.js). */
async function analyze(text) {
  let res;
  try {
    res = await fetch(`${env.aiServiceUrl}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Internal-Key": env.aiInternalKey },
      body: JSON.stringify({ text }),
    });
  } catch (e) {
    throw new Error(`ai-service unreachable: ${e.message}`);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`ai-service error ${res.status}: ${body?.error?.message || "unknown"}`);
  }
  return res.json();
}

module.exports = { analyze };
