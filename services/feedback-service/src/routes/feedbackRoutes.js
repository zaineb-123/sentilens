"use strict";
const { Router } = require("express");
const multer = require("multer");
const { validate, requireAuth, requireRole } = require("@sentilens/shared");
const env = require("../config/env");
const v = require("../validators/feedbackValidators");
const feedback = require("../controllers/feedbackController");
const imports = require("../controllers/importController");

const router = Router();
const auth = requireAuth(env.jwtSecret);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxCsvBytes },
  fileFilter: (req, file, cb) => cb(null, file.mimetype === "text/csv" || file.originalname.endsWith(".csv")),
});

// --- Employee ---
router.post("/feedback", auth, requireRole("employee"), validate(v.submitFeedbackSchema), feedback.submit);
router.get("/feedback/receipt/:code", auth, requireRole("employee"), feedback.statusByReceipt);

// --- HR ---
router.get("/feedback", auth, requireRole("hr"), validate(v.explorerQuerySchema, "query"), feedback.explore);
router.post("/feedback/import", auth, requireRole("hr"), upload.single("file"), imports.upload);
router.get("/feedback/batches/:id", auth, requireRole("hr"), imports.getBatch);

module.exports = router;
