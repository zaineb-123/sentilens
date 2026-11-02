"use strict";
const Organization = require("../models/Organization");
const { notFound, conflict } = require("@sentilens/shared");
const audit = require("../services/auditService");

async function create(req, res, next) {
  try {
    const exists = await Organization.findOne({ slug: req.body.slug });
    if (exists) return next(conflict("an organization with this slug already exists"));
    const org = await Organization.create(req.body);
    await audit.record({ orgId: org._id, actorId: req.user.id, actorRole: req.user.role, action: "org.create", resource: "organization", resourceId: String(org._id) });
    res.status(201).json({ organization: org });
  } catch (e) { next(e); }
}

async function list(req, res, next) {
  try { res.json({ organizations: await Organization.find().sort({ createdAt: -1 }) }); } catch (e) { next(e); }
}

async function get(req, res, next) {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return next(notFound("organization not found"));
    res.json({ organization: org });
  } catch (e) { next(e); }
}

async function updateSettings(req, res, next) {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return next(notFound("organization not found"));
    Object.assign(org.settings, req.body);
    await org.save();
    await audit.record({ orgId: org._id, actorId: req.user.id, actorRole: req.user.role, action: "org.settings.update", resource: "organization", resourceId: String(org._id), meta: req.body });
    res.json({ organization: org });
  } catch (e) { next(e); }
}

module.exports = { create, list, get, updateSettings };
