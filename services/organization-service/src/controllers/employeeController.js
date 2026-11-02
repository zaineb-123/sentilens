"use strict";
const EmployeeProfile = require("../models/EmployeeProfile");
const { notFound } = require("@sentilens/shared");

/** Called by the Auth Service (internal) right after a successful registration. */
async function upsertProfile(req, res, next) {
  try {
    const { userId, departmentId = null, locale = "fr" } = req.body;
    const profile = await EmployeeProfile.findOneAndUpdate(
      { userId },
      { userId, orgId: req.body.orgId, departmentId, locale },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    res.status(201).json({ profile });
  } catch (e) { next(e); }
}

async function myProfile(req, res, next) {
  try {
    const profile = await EmployeeProfile.findOne({ userId: req.user.id });
    if (!profile) return next(notFound("profile not found"));
    res.json({ profile });
  } catch (e) { next(e); }
}

async function updateMyProfile(req, res, next) {
  try {
    const profile = await EmployeeProfile.findOneAndUpdate(
      { userId: req.user.id }, { $set: req.body }, { new: true },
    );
    if (!profile) return next(notFound("profile not found"));
    res.json({ profile });
  } catch (e) { next(e); }
}

module.exports = { upsertProfile, myProfile, updateMyProfile };
