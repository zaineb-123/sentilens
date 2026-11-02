"use strict";
module.exports = {
  openapi: "3.0.3",
  info: { title: "SentiLens Auth Service", version: "1.0.0", description: "Registration, login, JWT, refresh-token rotation, RBAC." },
  servers: [{ url: "/api/auth" }],
  paths: {
    "/register": { post: { summary: "Register via invitation", requestBody: { required: true }, responses: { 201: { description: "Session created" }, 400: { description: "Invalid invitation" }, 409: { description: "Account already exists" } } } },
    "/login": { post: { summary: "Login", responses: { 200: { description: "Session created" }, 401: { description: "Invalid credentials" } } } },
    "/refresh": { post: { summary: "Rotate refresh token", responses: { 200: { description: "New session" }, 401: { description: "Invalid/expired/reused token" } } } },
    "/logout": { post: { summary: "Revoke refresh token", responses: { 204: { description: "Logged out" } } } },
    "/forgot-password": { post: { summary: "Request password reset", responses: { 202: { description: "Accepted (always, to avoid user enumeration)" } } } },
    "/reset-password": { post: { summary: "Reset password with token", responses: { 200: { description: "Password updated" }, 400: { description: "Invalid/expired token" } } } },
    "/me": { get: { summary: "Current user", security: [{ bearerAuth: [] }], responses: { 200: { description: "User" }, 401: { description: "Unauthenticated" } } } },
    "/users": { get: { summary: "List users in my org (admin)" } },
    "/users/invite": { post: { summary: "Invite a user by email + role (admin)" } },
    "/users/{id}/status": { patch: { summary: "Enable/disable a user (admin)" } },
  },
  components: { securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } } },
};
