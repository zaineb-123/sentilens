"use strict";
const { z } = require("zod");

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(10).max(200),
  invitationCode: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(10).max(200),
});

module.exports = { registerSchema, loginSchema, refreshSchema, forgotPasswordSchema, resetPasswordSchema };
