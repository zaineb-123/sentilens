"use strict";
const { Router } = require("express");
const { unauthorized } = require("@sentilens/shared");
const env = require("../config/env");
const worker = require("../services/worker");
const Analysis = require("../models/Analysis");
const Job = require("../models/Job");

const router = Router();
router.use((req, res, next) => {
  if (env.internalKey && req.headers["x-internal-key"] !== env.internalKey) return next(unauthorized("missing or invalid internal key"));
  next();
});

/** Called by the Feedback Service right after a submission, as a latency optimization -
 *  the periodic poll loop (see server.js) would pick it up anyway within POLL_INTERVAL_MS. */
router.post("/jobs", (req, res) => {
  res.status(202).json({ accepted: true });
  setImmediate(() => { worker.runOnce(1).catch(() => {}); });
});

/** Manual/ops trigger - also used by tests instead of waiting for the interval timer. */
router.post("/run-once", async (req, res, next) => {
  try { res.json(await worker.runOnce(req.body?.limit)); } catch (e) { next(e); }
});

router.get("/analyses/:feedbackId", async (req, res, next) => {
  try { res.json({ analysis: await Analysis.findOne({ feedbackId: req.params.feedbackId }) }); } catch (e) { next(e); }
});

router.get("/jobs/:feedbackId", async (req, res, next) => {
  try { res.json({ job: await Job.findOne({ feedbackId: req.params.feedbackId }) }); } catch (e) { next(e); }
});

module.exports = router;
