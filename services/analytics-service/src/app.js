"use strict";
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const rateLimit = require("express-rate-limit");
const { errorHandler, notFoundHandler } = require("@sentilens/shared");
const analyticsRoutes = require("./routes/analyticsRoutes");
const internalRoutes = require("./routes/internalRoutes");
const openapi = require("./openapi");

function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
  app.use(express.json({ limit: "300kb" }));
  app.use(rateLimit({ windowMs: 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));
  if (process.env.NODE_ENV !== "test") app.use(morgan("tiny"));

  app.get("/health", (req, res) => res.json({ status: "ok", service: "analytics-service" }));
  app.get("/health/ready", (req, res) => {
    const mongoose = require("mongoose");
    const ready = mongoose.connection.readyState === 1;
    res.status(ready ? 200 : 503).json({ ready, service: "analytics-service" });
  });
  app.get("/openapi.json", (req, res) => res.json(openapi));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));

  app.use("/api", analyticsRoutes);
  app.use("/internal", internalRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler());
  return app;
}

module.exports = { createApp };
