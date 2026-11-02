"use strict";
const { Router } = require("express");
const { requireAuth } = require("@sentilens/shared");
const env = require("../config/env");
const c = require("../controllers/notificationController");

const router = Router();
const auth = requireAuth(env.jwtSecret);

router.get("/notifications", auth, c.list);
router.get("/notifications/unread-count", auth, c.unreadCount);
router.patch("/notifications/:id/read", auth, c.markRead);

module.exports = router;
