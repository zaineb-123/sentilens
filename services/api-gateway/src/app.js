"use strict";
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
// Receipt codes are bearer secrets for an anonymous author: never write them to access logs.
morgan.token("safe-url", (req) => (req.originalUrl || req.url).replace(/(\/receipt\/)[^/?#]+/i, "$1[redacted]"));
const swaggerUi = require("swagger-ui-express");
const rateLimit = require("express-rate-limit");
const { errorHandler, notFoundHandler, requireAuth } = require("@sentilens/shared");
const env = require("./config/env");
const { correlationId } = require("./middleware/correlationId");
const { attachDepartmentHeader } = require("./middleware/attachDepartment");
const { proxyTo } = require("./services/proxy");
const { buildMergedOpenApi } = require("./services/mergedOpenApi");
const systemHealth = require("./services/systemHealth");
const { requireRole } = require("@sentilens/shared");

function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
 app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
  app.use(correlationId);
  app.use(rateLimit({ windowMs: env.rateLimit.windowMs, limit: env.rateLimit.limit, standardHeaders: true, legacyHeaders: false }));
  if (process.env.NODE_ENV !== "test") app.use(morgan(":method :safe-url :status :res[content-length] - :response-time ms"));

  // Body parsers: only engage for matching content-types, so other requests (GET/DELETE with
  // no body, or bodies this gateway doesn't need to inspect) pass through untouched.
  app.use(express.json({ limit: "300kb" }));
  app.use(express.raw({ type: "multipart/form-data", limit: "10mb" })); // CSV import: forwarded as a raw buffer, boundary preserved

  app.get("/health", (req, res) => res.json({ status: "ok", service: "api-gateway" }));

  const openapi = buildMergedOpenApi();
  app.get("/api/openapi.json", (req, res) => res.json(openapi));
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapi));

  const authMw = requireAuth(env.jwtSecret);
  const { services } = env;

  // --- Auth: no gateway-level auth gate (register/login have no token yet; /me is
  //     protected by the Auth Service itself) ---
  app.use("/api/auth", proxyTo(services.auth));

  // --- Organization: orgs, departments, audit logs, settings, my employee profile ---
  app.use("/api/organizations", authMw, proxyTo(services.organization));
  app.use("/api/departments", authMw, proxyTo(services.organization));
  app.use("/api/audit-logs", authMw, proxyTo(services.organization));
  app.use("/api/settings", authMw, proxyTo(services.organization));
  app.use("/api/me/profile", authMw, proxyTo(services.organization));

  // --- Survey: more specific "/available" (employee) mounted before the general prefix (hr CRUD) ---
  app.use("/api/me/participations", authMw, proxyTo(services.survey));
  app.use("/api/surveys/available", authMw, attachDepartmentHeader(), proxyTo(services.survey));
  app.use("/api/surveys", authMw, proxyTo(services.survey));

  // --- Feedback: anonymous-submission orchestration (department header) lives here ---
  app.use("/api/feedback", authMw, attachDepartmentHeader(), proxyTo(services.feedback));

  // --- Analytics & alerts ---
  app.use("/api/analytics", authMw, proxyTo(services.analytics));
  app.use("/api/alerts", authMw, proxyTo(services.analytics));

  // --- Notifications ---
  app.use("/api/notifications", authMw, proxyTo(services.notification));

  app.get("/api/system/health", authMw, requireRole("admin"), async (req, res, next) => {
    try { res.json(await systemHealth.checkAll()); } catch (e) { next(e); }
  });

  app.use(notFoundHandler);
  app.use(errorHandler());
  return app;
}

module.exports = { createApp };
