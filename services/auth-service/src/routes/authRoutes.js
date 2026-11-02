"use strict";
const { Router } = require("express");
const rateLimit = require("express-rate-limit");
const { validate, requireAuth } = require("@sentilens/shared");
const env = require("../config/env");
const v = require("../validators/authValidators");
const c = require("../controllers/authController");
const admin = require("../controllers/adminController");
const av = require("../validators/adminValidators");
const { requireRole } = require("@sentilens/shared");

const router = Router();

// Stricter limiter on credential-guessing endpoints, in addition to the global gateway limiter.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });

router.post("/register", authLimiter, validate(v.registerSchema), c.register);
router.post("/login", authLimiter, validate(v.loginSchema), c.login);
router.post("/refresh", validate(v.refreshSchema.partial()), c.refresh);
router.post("/logout", c.logout);
router.post("/forgot-password", authLimiter, validate(v.forgotPasswordSchema), c.forgotPassword);
router.post("/reset-password", authLimiter, validate(v.resetPasswordSchema), c.resetPassword);
router.get("/me", requireAuth(env.jwtSecret), c.me);

router.get("/users", requireAuth(env.jwtSecret), requireRole("admin"), validate(av.listUsersQuerySchema, "query"), admin.listUsers);
router.post("/users/invite", requireAuth(env.jwtSecret), requireRole("admin"), validate(av.inviteUserSchema), admin.inviteUser);
router.patch("/users/:id/status", requireAuth(env.jwtSecret), requireRole("admin"), validate(av.updateUserStatusSchema), admin.updateUserStatus);

module.exports = router;
