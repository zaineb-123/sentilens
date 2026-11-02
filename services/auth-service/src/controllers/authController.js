"use strict";
const authService = require("../services/authService");
const { badRequest } = require("@sentilens/shared");

const REFRESH_COOKIE = "sentilens_refresh";
const cookieOpts = (expires) => ({
  httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict",
  path: "/api/auth", expires,
});

function sendSession(res, status, session) {
  res.cookie(REFRESH_COOKIE, session.refreshToken, cookieOpts(session.refreshExpiresAt));
  res.status(status).json({ user: session.user, accessToken: session.accessToken });
}

function readRefreshToken(req) {
  return (req.cookies && req.cookies[REFRESH_COOKIE]) || (req.body && req.body.refreshToken);
}

async function register(req, res, next) {
  try { sendSession(res, 201, await authService.register(req.body)); } catch (e) { next(e); }
}

async function login(req, res, next) {
  try { sendSession(res, 200, await authService.login(req.body)); } catch (e) { next(e); }
}

async function refresh(req, res, next) {
  try {
    const raw = readRefreshToken(req);
    if (!raw) return next(badRequest("missing refresh token"));
    sendSession(res, 200, await authService.refresh(raw));
  } catch (e) { next(e); }
}

async function logout(req, res, next) {
  try {
    const raw = readRefreshToken(req);
    if (raw) await authService.logout(raw);
    res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
    res.status(204).end();
  } catch (e) { next(e); }
}

async function forgotPassword(req, res, next) {
  try {
    const resetToken = await authService.forgotPassword(req.body.email);
    if (resetToken) {
      // TODO(notification-service): publish a "password_reset_requested" event instead of
      // returning the token. Returned here only because Notification Service does not exist yet.
      return res.status(202).json({ message: "if the account exists, a reset link was generated", devResetToken: resetToken });
    }
    res.status(202).json({ message: "if the account exists, a reset link was generated" });
  } catch (e) { next(e); }
}

async function resetPassword(req, res, next) {
  try {
    await authService.resetPassword(req.body);
    res.status(200).json({ message: "password updated" });
  } catch (e) { next(e); }
}

async function me(req, res) {
  const User = require("../models/User");
  const user = await User.findById(req.user.id);
  res.json({ user });
}

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword, me };
