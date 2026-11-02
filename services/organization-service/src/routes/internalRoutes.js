"use strict";
const { Router } = require("express");
const { unauthorized } = require("@sentilens/shared");
const env = require("../config/env");
const v = require("../validators/orgValidators");
const { validate } = require("@sentilens/shared");
const employees = require("../controllers/employeeController");
const { getMinGroupSize } = require("../services/thresholdService");

const router = Router();
router.use((req, res, next) => {
  if (env.internalKey && req.headers["x-internal-key"] !== env.internalKey) return next(unauthorized("missing or invalid internal key"));
  next();
});

router.get("/employee-profiles/:userId", async (req, res, next) => {
  try {
    const EmployeeProfile = require("../models/EmployeeProfile");
    const profile = await EmployeeProfile.findOne({ userId: req.params.userId }).select("departmentId orgId locale").lean();
    res.json({ profile: profile || null });
  } catch (e) { next(e); }
});

router.post("/employee-profiles", validate(v.upsertEmployeeProfileSchema.extend({ orgId: require("zod").string().min(1) })), employees.upsertProfile);

router.get("/departments/resolve", async (req, res, next) => {
  try {
    const Department = require("../models/Department");
    const { orgId, names } = req.query;
    const list = (names || "").split(",").map((n) => n.trim()).filter(Boolean);
    const found = await Department.find({ orgId, name: { $in: list } }).select("name");
    const map = Object.fromEntries(found.map((d) => [d.name, String(d._id)]));
    res.json({ map });
  } catch (e) { next(e); }
});

router.get("/organizations/:orgId/min-group-size", async (req, res, next) => {
  try { res.json({ minGroupSize: await getMinGroupSize(req.params.orgId) }); } catch (e) { next(e); }
});

module.exports = router;
