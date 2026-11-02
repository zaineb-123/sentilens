"use strict";
const { Router } = require("express");
const { unauthorized, badRequest } = require("@sentilens/shared");
const env = require("../config/env");
const notificationService = require("../services/notificationService");

const router = Router();
router.use((req, res, next) => {
  if (env.internalKey && req.headers["x-internal-key"] !== env.internalKey) return next(unauthorized("missing or invalid internal key"));
  next();
});

/** Called by any service that needs to notify an HR/admin user (Analytics on new alerts,
 *  Feedback on CSV import completion, Auth on invitations, etc). */
router.post("/notifications", async (req, res, next) => {
  try {
    const { orgId, recipientUserId, type, title } = req.body;
    if (!orgId || !recipientUserId || !type || !title) return next(badRequest("orgId, recipientUserId, type and title are required"));
    res.status(201).json({ notification: await notificationService.create(req.body) });
  } catch (e) { next(e); }
});

module.exports = router;
