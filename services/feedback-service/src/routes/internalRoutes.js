"use strict";
// Not exposed by the API Gateway. Polled by the Analysis Service so that feedback is never
// lost if the AI/Analysis pipeline is temporarily down (see docs/ai.md).
const { Router } = require("express");
const { unauthorized, badRequest } = require("@sentilens/shared");
const env = require("../config/env");
const Feedback = require("../models/Feedback");

const router = Router();
router.use((req, res, next) => {
  if (env.internalKey && req.headers["x-internal-key"] !== env.internalKey) return next(unauthorized("missing or invalid internal key"));
  next();
});

const LOCK_TIMEOUT_MS = 5 * 60 * 1000; // a claimed-but-never-updated job is releasable after this

/** Atomically claims up to `limit` pending (or stale-locked) feedback docs for processing. */
router.get("/feedback/pending", async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const staleBefore = new Date(Date.now() - LOCK_TIMEOUT_MS);
    const claimed = [];
    for (let i = 0; i < limit; i += 1) {
      const doc = await Feedback.findOneAndUpdate(
        {
          $or: [
            { analysisStatus: "pending" },
            { analysisStatus: "processing", lockedAt: { $lt: staleBefore } },
          ],
        },
        { analysisStatus: "processing", lockedAt: new Date() },
        { new: true, sort: { createdAt: 1 } },
      ).select("orgId departmentId surveyId comment day");
      if (!doc) break;
      claimed.push(doc);
    }
    res.json({ items: claimed, count: claimed.length });
  } catch (e) { next(e); }
});

router.patch("/feedback/:id/analysis-status", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["done", "failed", "pending"].includes(status)) return next(badRequest("invalid status"));
    const doc = await Feedback.findByIdAndUpdate(req.params.id, { analysisStatus: status, lockedAt: null }, { new: true });
    res.json({ id: doc?._id, analysisStatus: doc?.analysisStatus });
  } catch (e) { next(e); }
});

module.exports = router;
