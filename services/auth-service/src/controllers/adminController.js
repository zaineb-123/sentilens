"use strict";
const crypto = require("crypto");
const User = require("../models/User");
const Invitation = require("../models/Invitation");
const { notFound, badRequest } = require("@sentilens/shared");

async function listUsers(req, res, next) {
  try {
    const filter = { orgId: req.user.orgId, ...req.query };
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ users });
  } catch (e) { next(e); }
}

async function inviteUser(req, res, next) {
  try {
    const { email, role, expiresInHours } = req.body;
    const existing = await User.findOne({ email, orgId: req.user.orgId });
    if (existing) return next(badRequest("a user with this email already exists in your organization"));
    const code = crypto.randomBytes(16).toString("hex");
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    const invite = await Invitation.create({ email, orgId: req.user.orgId, role, codeHash, expiresAt });
    res.status(201).json({ invitation: { id: invite._id, email, role, expiresAt }, invitationCode: code });
  } catch (e) { next(e); }
}

async function updateUserStatus(req, res, next) {
  try {
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, orgId: req.user.orgId }, { status: req.body.status }, { new: true },
    );
    if (!user) return next(notFound("user not found"));
    res.json({ user });
  } catch (e) { next(e); }
}

module.exports = { listUsers, inviteUser, updateUserStatus };
