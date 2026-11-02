"use strict";
const { Router } = require("express");
const { validate, requireAuth, requireRole } = require("@sentilens/shared");
const env = require("../config/env");
const v = require("../validators/orgValidators");
const orgs = require("../controllers/organizationController");
const depts = require("../controllers/departmentController");
const employees = require("../controllers/employeeController");
const auditLogs = require("../controllers/auditController");

const router = Router();
const auth = requireAuth(env.jwtSecret);

// --- Organizations (admin only) ---
router.post("/organizations", auth, requireRole("admin"), validate(v.createOrganizationSchema), orgs.create);
router.get("/organizations", auth, requireRole("admin"), orgs.list);
router.get("/organizations/:id", auth, requireRole("admin"), orgs.get);
router.put("/organizations/:id/settings", auth, requireRole("admin"), validate(v.updateSettingsSchema), orgs.updateSettings);
router.get("/settings", auth, requireRole("admin", "hr"), orgs.get); // HR needs to read (not edit) the threshold, etc.

// --- Departments (admin manages; hr reads) ---
router.get("/departments", auth, requireRole("admin", "hr"), depts.list);
router.post("/departments", auth, requireRole("admin"), validate(v.createDepartmentSchema), depts.create);
router.put("/departments/:id", auth, requireRole("admin"), validate(v.updateDepartmentSchema), depts.update);
router.delete("/departments/:id", auth, requireRole("admin"), depts.remove);

// --- Employee profile (self-service) ---
router.get("/me/profile", auth, employees.myProfile);
router.patch("/me/profile", auth, validate(v.upsertEmployeeProfileSchema.pick({ departmentId: true, locale: true }).partial().strict()), employees.updateMyProfile);

// --- Audit logs (admin only) ---
router.get("/audit-logs", auth, requireRole("admin"), validate(v.auditLogQuerySchema, "query"), auditLogs.list);

module.exports = router;
