"use strict";
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");
const RefreshToken = require("../models/RefreshToken");
const env = require("../config/env");

const ACCESS_TTL = "15m";

function signAccessToken(user) {
  return jwt.sign(
    { sub: String(user._id), orgId: String(user.orgId), role: user.role },
    env.jwtSecret,
    { expiresIn: ACCESS_TTL, issuer: "sentilens-auth" },
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret, { issuer: "sentilens-auth" });
}

function hashToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

/** Issues a refresh token, starting a new rotation family (used at login). */
async function issueRefreshFamily(userId) {
  return issueRefreshToken(userId, uuid());
}

/** Issues a refresh token within an existing rotation family (used at /refresh). */
async function issueRefreshToken(userId, family) {
  const raw = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + env.refreshTtlDays * 24 * 60 * 60 * 1000);
  await RefreshToken.create({ userId, tokenHash: hashToken(raw), family, expiresAt });
  return { raw, family, expiresAt };
}

/**
 * Verifies a presented refresh token and rotates it.
 * Returns { userId, family } on success.
 * Throws "REUSE_DETECTED" if a revoked token is replayed (the whole family is revoked).
 * Throws "INVALID" if the token is unknown or expired.
 */
async function rotateRefreshToken(rawToken) {
  const tokenHash = hashToken(rawToken);
  const record = await RefreshToken.findOne({ tokenHash });
  if (!record) throw new Error("INVALID");
  if (record.revokedAt || record.expiresAt < new Date()) {
    if (record.revokedAt) {
      await RefreshToken.updateMany({ family: record.family, revokedAt: null }, { revokedAt: new Date() });
      throw new Error("REUSE_DETECTED");
    }
    throw new Error("INVALID");
  }
  record.revokedAt = new Date();
  await record.save();
  return { userId: record.userId, family: record.family };
}

async function revokeFamily(family) {
  await RefreshToken.updateMany({ family, revokedAt: null }, { revokedAt: new Date() });
}

async function revokeAllForUser(userId) {
  await RefreshToken.updateMany({ userId, revokedAt: null }, { revokedAt: new Date() });
}

async function revokeToken(rawToken) {
  await RefreshToken.updateOne({ tokenHash: hashToken(rawToken) }, { revokedAt: new Date() });
}

module.exports = {
  signAccessToken, verifyAccessToken, issueRefreshFamily, issueRefreshToken,
  rotateRefreshToken, revokeFamily, revokeAllForUser, revokeToken, hashToken, ACCESS_TTL,
};
