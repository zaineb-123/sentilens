"use strict";
const { Router } = require("express");
const { validate, requireAuth, requireRole } = require("@sentilens/shared");
const env = require("../config/env");
const v = require("../validators/analyticsValidators");
const analytics = require("../controllers/analyticsController");
const alerts = require("../controllers/alertsController");

const router = Router();
const auth = requireAuth(env.jwtSecret);
const hrOnly = [auth, requireRole("hr")];

router.get("/analytics/overview", ...hrOnly, validate(v.filtersSchema, "query"), analytics.overview);
router.get("/analytics/sentiment", ...hrOnly, validate(v.filtersSchema, "query"), analytics.sentiment);
router.get("/analytics/emotions", ...hrOnly, validate(v.filtersSchema, "query"), analytics.emotions);
router.get("/analytics/aspects", ...hrOnly, validate(v.filtersSchema, "query"), analytics.aspects);
router.get("/analytics/trends", ...hrOnly, validate(v.filtersSchema, "query"), analytics.trends);
router.get("/analytics/departments", ...hrOnly, validate(v.departmentComparisonSchema, "query"), analytics.departments);
router.get("/analytics/export", ...hrOnly, validate(v.filtersSchema, "query"), analytics.exportCsv);

router.get("/alerts", ...hrOnly, validate(v.alertsQuerySchema, "query"), alerts.list);
router.patch("/alerts/:id", ...hrOnly, alerts.acknowledge);

module.exports = router;
