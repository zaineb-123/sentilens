"use strict";
const { Router } = require("express");
const { unauthorized } = require("@sentilens/shared");
const env = require("../config/env");
const ingestService = require("../services/ingestService");
const alertsService = require("../services/alertsService");

const router = Router();
router.use((req, res, next) => {
  if (env.internalKey && req.headers["x-internal-key"] !== env.internalKey) return next(unauthorized("missing or invalid internal key"));
  next();
});

/** Called by the Analysis Service after each successful analysis. */
router.post("/ingest", async (req, res, next) => {
  try { res.status(202).json(await ingestService.ingest(req.body)); } catch (e) { next(e); }
});

/** Manual/ops trigger for alert detection (also runs on a periodic timer - see server.js). */
router.post("/alerts/detect", async (req, res, next) => {
  try { res.json({ alerts: await alertsService.detectForOrg(req.body.orgId, req.body) }); } catch (e) { next(e); }
});

module.exports = router;
