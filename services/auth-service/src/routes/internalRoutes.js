"use strict";
// Not exposed by the API Gateway. Called service-to-service only (e.g. Organization Service
// verifying a role, or seed scripts provisioning the first admin).
const { Router } = require("express");
const { unauthorized } = require("@sentilens/shared");
const env = require("../config/env");
const User = require("../models/User");
const Invitation = require("../models/Invitation");
const crypto = require("crypto");

const router = Router();

router.use((req, res, next) => {
  if (env.internalKey && req.headers["x-internal-key"] !== env.internalKey) {
    return next(unauthorized("missing or invalid internal key"));
  }
  next();
});

router.get("/users/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.json({ user });
  } catch (e) { next(e); }
});

router.get("/users", async (req, res, next) => {
  try {
    const { orgId, role } = req.query;
    const filter = {};
    if (orgId) filter.orgId = orgId;
    if (role) filter.role = role;
    const users = await User.find(filter).select("_id role").lean();
    res.json({ userIds: users.map((u) => String(u._id)) });
  } catch (e) { next(e); }
});

router.post("/invitations", async (req, res, next) => {
  try {
    const { email, orgId, role, expiresInHours = 72 } = req.body;
    const code = crypto.randomBytes(16).toString("hex");
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    await Invitation.create({ email, orgId, role, codeHash, expiresAt });
    res.status(201).json({ code, expiresAt }); // handed to Notification Service by the caller
  } catch (e) { next(e); }
});

module.exports = router;
