"use strict";
module.exports = {
  openapi: "3.0.3",
  info: { title: "SentiLens Organization Service", version: "1.0.0", description: "Organizations, departments, employee profiles, privacy settings, audit logs." },
  servers: [{ url: "/api" }],
  paths: {
    "/organizations": { post: { summary: "Create organization (admin)" }, get: { summary: "List organizations (admin)" } },
    "/organizations/{id}": { get: { summary: "Get organization (admin)" } },
    "/organizations/{id}/settings": { put: { summary: "Update org settings incl. min group size (admin)" } },
    "/departments": { get: { summary: "List departments" }, post: { summary: "Create department (admin)" } },
    "/departments/{id}": { put: { summary: "Update department (admin)" }, delete: { summary: "Delete department (admin)" } },
    "/me/profile": { get: { summary: "My employee profile" }, patch: { summary: "Update my profile (department, locale)" } },
    "/audit-logs": { get: { summary: "List audit logs (admin)" } },
  },
  components: { securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } } },
};
