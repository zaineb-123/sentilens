"use strict";
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const Invitation = require("../models/Invitation");
const PasswordReset = require("../models/PasswordReset");
const env = require("../config/env");
const tokens = require("./tokenService");
const { ApiError, conflict, unauthorized, notFound } = require("@sentilens/shared");

function hashInviteCode(code) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

/** Consumes an invitation and creates the account. Registration is invite-only by design:
 *  there is no self-serve "become HR/admin" path. */
async function register({ email, password, invitationCode }) {
  const invite = await Invitation.findOne({ email, codeHash: hashInviteCode(invitationCode) });
  if (!invite || invite.consumedAt || invite.expiresAt < new Date()) {
    throw new ApiError(400, "INVALID_INVITATION", "invitation is invalid, expired or already used");
  }
  const existing = await User.findOne({ email });
  if (existing) throw conflict("an account already exists for this email");

  const passwordHash = await bcrypt.hash(password, env.bcryptRounds);
  const user = await User.create({ email, passwordHash, role: invite.role, orgId: invite.orgId, status: "active" });
  invite.consumedAt = new Date();
  await invite.save();
  return issueSession(user);
}

async function login({ email, password }) {
  const user = await User.findOne({ email });
  // Constant-shape response whether the user exists or not, to avoid user enumeration.
  const hash = user ? user.passwordHash : "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva";
  const ok = await bcrypt.compare(password, hash);
  if (!user || !ok) throw unauthorized("invalid email or password");
  if (user.status !== "active") throw unauthorized("account is not active");
  user.lastLoginAt = new Date();
  await user.save();
  return issueSession(user);
}

async function issueSession(user) {
  const accessToken = tokens.signAccessToken(user);
  const refresh = await tokens.issueRefreshFamily(user._id);
  return { user, accessToken, refreshToken: refresh.raw, refreshExpiresAt: refresh.expiresAt };
}

async function refresh(rawToken) {
  let rotation;
  try {
    rotation = await tokens.rotateRefreshToken(rawToken);
  } catch (e) {
    if (e.message === "REUSE_DETECTED") {
      throw unauthorized("refresh token reuse detected; all sessions revoked");
    }
    throw unauthorized("invalid or expired refresh token");
  }
  const user = await User.findById(rotation.userId);
  if (!user || user.status !== "active") throw unauthorized("account is not active");
  const accessToken = tokens.signAccessToken(user);
  const next = await tokens.issueRefreshToken(user._id, rotation.family);
  return { user, accessToken, refreshToken: next.raw, refreshExpiresAt: next.expiresAt };
}

async function logout(rawToken) {
  await tokens.revokeToken(rawToken);
}

async function forgotPassword(email) {
  const user = await User.findOne({ email });
  if (!user) return null; // do not reveal whether the account exists
  const raw = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  await PasswordReset.create({ userId: user._id, tokenHash: tokens.hashToken(raw), expiresAt });
  return raw; // handed to Notification Service by the controller; never logged
}

async function resetPassword({ token, password }) {
  const record = await PasswordReset.findOne({ tokenHash: tokens.hashToken(token) });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw new ApiError(400, "INVALID_RESET_TOKEN", "reset token is invalid or expired");
  }
  const user = await User.findById(record.userId);
  if (!user) throw notFound("user not found");
  user.passwordHash = await bcrypt.hash(password, env.bcryptRounds);
  await user.save();
  record.usedAt = new Date();
  await record.save();
  await tokens.revokeAllForUser(user._id); // force re-login everywhere after a password reset
  return true;
}

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword, issueSession };
