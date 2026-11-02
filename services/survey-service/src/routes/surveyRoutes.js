"use strict";
const { Router } = require("express");
const { validate, requireAuth, requireRole } = require("@sentilens/shared");
const env = require("../config/env");
const v = require("../validators/surveyValidators");
const c = require("../controllers/surveyController");

const router = Router();
const auth = requireAuth(env.jwtSecret);

// --- HR survey management ---
router.post("/surveys", auth, requireRole("hr"), validate(v.createSurveySchema), c.create);
router.get("/surveys", auth, requireRole("hr"), c.listForHr);
router.put("/surveys/:id", auth, requireRole("hr"), validate(v.updateSurveySchema), c.update);
router.delete("/surveys/:id", auth, requireRole("hr"), c.remove);
router.post("/surveys/:id/publish", auth, requireRole("hr"), c.publish);
router.post("/surveys/:id/close", auth, requireRole("hr"), c.close);
router.get("/surveys/:id/participation", auth, requireRole("hr"), c.participationStats);

// --- Employee survey access ---
// NOTE: employees hit a different listing/get (published + targeted only); Express dispatches
// on method+path, so we mount these under a role check that inspects req.user.role at runtime.
router.get("/surveys/available", auth, requireRole("employee"), c.listForEmployee);
router.get("/surveys/available/:id", auth, requireRole("employee"), c.getForEmployee);
router.get("/me/participations", auth, requireRole("employee"), c.myParticipations);

// HR can also fetch a single survey by id (edit screen) - after the employee-only routes above
// so "/surveys/available" never matches this generic :id route.
router.get("/surveys/:id", auth, requireRole("hr"), c.get);

module.exports = router;
