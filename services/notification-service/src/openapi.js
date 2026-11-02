"use strict";
module.exports = {
  openapi: "3.0.3",
  info: { title: "SentiLens Notification Service", version: "1.0.0", description: "In-app notifications for HR/admin users, with optional best-effort email via SMTP." },
  servers: [{ url: "/api" }],
  paths: {
    "/notifications": { get: { summary: "List my notifications (optional ?unread=true)" } },
    "/notifications/unread-count": { get: { summary: "My unread count (for a nav badge)" } },
    "/notifications/{id}/read": { patch: { summary: "Mark one notification as read" } },
  },
  components: { securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } } },
};
