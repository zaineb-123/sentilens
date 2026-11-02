"use strict";
const env = require("../config/env");

async function checkAll() {
  const targets = { ai: process.env.AI_SERVICE_URL || "http://ai-service:8000", ...env.services };
  const entries = await Promise.all(
    Object.entries(targets).map(async ([name, baseUrl]) => {
      const started = Date.now();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      try {
        const res = await fetch(`${baseUrl}/health`, { signal: controller.signal });
        return [name, { status: res.ok ? "up" : "down", latencyMs: Date.now() - started }];
      } catch (e) {
        return [name, { status: "down", latencyMs: Date.now() - started, error: e.message }];
      } finally {
        clearTimeout(timeout);
      }
    }),
  );
  const services = Object.fromEntries(entries);
  const overall = Object.values(services).every((s) => s.status === "up") ? "up" : "degraded";
  return { overall, services, checkedAt: new Date().toISOString() };
}

module.exports = { checkAll };
