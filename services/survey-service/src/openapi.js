"use strict";
module.exports = {
  openapi: "3.0.3",
  info: { title: "SentiLens Survey Service", version: "1.0.0", description: "Survey CRUD, publishing, and participation tracking (no answers stored here)." },
  servers: [{ url: "/api" }],
  paths: {
    "/surveys": { post: { summary: "Create survey (hr)" }, get: { summary: "List surveys (hr)" } },
    "/surveys/{id}": { get: { summary: "Get survey (hr)" }, put: { summary: "Update draft survey (hr)" }, delete: { summary: "Delete draft survey (hr)" } },
    "/surveys/{id}/publish": { post: { summary: "Publish survey (hr)" } },
    "/surveys/{id}/close": { post: { summary: "Close survey (hr)" } },
    "/surveys/{id}/participation": { get: { summary: "Aggregate participation count (hr)" } },
    "/surveys/available": { get: { summary: "List surveys available to me (employee)" } },
    "/surveys/available/{id}": { get: { summary: "Get an available survey (employee)" } },
    "/me/participations": { get: { summary: "My participation history (employee)" } },
  },
  components: { securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } } },
};
