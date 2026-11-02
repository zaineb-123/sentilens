"use strict";
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const { errorHandler, notFoundHandler } = require("@sentilens/shared");
const authRoutes = require("./routes/authRoutes");
const internalRoutes = require("./routes/internalRoutes");
const openapi = require("./openapi");

function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());
  if (process.env.NODE_ENV !== "test") app.use(morgan("tiny"));

  app.get("/health", (req, res) => res.json({ status: "ok", service: "auth-service" }));
  app.get("/health/ready", (req, res) => {
    const mongoose = require("mongoose");
    const ready = mongoose.connection.readyState === 1;
    res.status(ready ? 200 : 503).json({ ready, service: "auth-service" });
  });
  app.get("/openapi.json", (req, res) => res.json(openapi));
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));

  app.use("/api/auth", authRoutes);
  app.use("/internal", internalRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler());
  return app;
}

module.exports = { createApp };
