"use strict";
const { Router } = require("express");
const { unauthorized } = require("@sentilens/shared");
const env = require("../config/env");
const c = require("../controllers/internalController");

const router = Router();
router.use((req, res, next) => {
  if (env.internalKey && req.headers["x-internal-key"] !== env.internalKey) return next(unauthorized("missing or invalid internal key"));
  next();
});

router.post("/participation/check-and-record", c.checkAndRecord);
router.get("/surveys/:id", c.getById);

module.exports = router;
