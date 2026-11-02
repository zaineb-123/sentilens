"use strict";
module.exports = {
  openapi: "3.0.3",
  info: { title: "SentiLens Feedback Service", version: "1.0.0", description: "Anonymous feedback submission, receipts, CSV import, HR explorer. Never stores userId, IP, or user-agent." },
  servers: [{ url: "/api" }],
  paths: {
    "/feedback": {
      post: { summary: "Submit feedback (employee, anonymous)" },
      get: { summary: "Explore feedback (hr; department-level results gated by k-anonymity threshold)" },
    },
    "/feedback/receipt/{code}": { get: { summary: "Check analysis status by receipt code (employee)" } },
    "/feedback/import": { post: { summary: "Import feedback from CSV (hr)" } },
    "/feedback/batches/{id}": { get: { summary: "Get CSV import batch summary (hr)" } },
  },
  components: { securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } } },
};
