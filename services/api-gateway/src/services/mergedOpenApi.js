"use strict";
// Pure, synchronous aggregation: each backend service's OpenAPI module is required directly
// from the monorepo (no network calls, no runtime dependency on the services being up) and
// merged into one document served at /api/docs. Internal-only services (Analysis) are excluded
// since they have no public routes through the gateway.
const authSpec = require("../../../auth-service/src/openapi");
const organizationSpec = require("../../../organization-service/src/openapi");
const surveySpec = require("../../../survey-service/src/openapi");
const feedbackSpec = require("../../../feedback-service/src/openapi");
const analyticsSpec = require("../../../analytics-service/src/openapi");
const notificationSpec = require("../../../notification-service/src/openapi");

const SPECS = [authSpec, organizationSpec, surveySpec, feedbackSpec, analyticsSpec, notificationSpec];

function buildMergedOpenApi() {
  const paths = {};
  for (const spec of SPECS) {
    const prefix = (spec.servers?.[0]?.url || "").replace(/\/$/, "");
    for (const [path, def] of Object.entries(spec.paths || {})) {
      paths[prefix + path] = def;
    }
  }
  paths["/api/system/health"] = { get: { summary: "Aggregated health of every backend service (admin)" } };

  return {
    openapi: "3.0.3",
    info: {
      title: "SentiLens API",
      version: "1.0.0",
      description: "Single entry point for the SentiLens frontend. Aggregates Auth, Organization, Survey, Feedback, Analytics and Notification services. The Analysis and AI services are internal-only and not reachable through this gateway.",
    },
    servers: [{ url: "/" }],
    paths,
    components: { securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } } },
  };
}

module.exports = { buildMergedOpenApi };
