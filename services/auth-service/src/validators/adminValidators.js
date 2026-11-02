"use strict";
const { z } = require("zod");

const inviteUserSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(["employee", "hr", "admin"]),
  expiresInHours: z.number().int().min(1).max(24 * 14).optional().default(72),
});
const updateUserStatusSchema = z.object({ status: z.enum(["active", "disabled"]) });
const listUsersQuerySchema = z.object({
  role: z.enum(["employee", "hr", "admin"]).optional(),
  status: z.enum(["invited", "active", "disabled"]).optional(),
});

module.exports = { inviteUserSchema, updateUserStatusSchema, listUsersQuerySchema };
