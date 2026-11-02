"use strict";
const { v4: uuid } = require("uuid");

/** Reuses an inbound X-Correlation-Id if the caller already set one (e.g. a prior hop or a
 *  test), otherwise mints a new one. Always echoed back on the response so the frontend can
 *  log it, and forwarded downstream so logs across services can be correlated per request. */
function correlationId(req, res, next) {
  req.correlationId = req.headers["x-correlation-id"] || uuid();
  res.setHeader("X-Correlation-Id", req.correlationId);
  next();
}

module.exports = { correlationId };
