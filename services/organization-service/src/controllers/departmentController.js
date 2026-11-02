"use strict";
const Department = require("../models/Department");
const { notFound, conflict } = require("@sentilens/shared");
const audit = require("../services/auditService");

async function list(req, res, next) {
  try { res.json({ departments: await Department.find({ orgId: req.user.orgId }).sort({ name: 1 }) }); } catch (e) { next(e); }
}

async function create(req, res, next) {
  try {
    const exists = await Department.findOne({ orgId: req.user.orgId, name: req.body.name });
    if (exists) return next(conflict("a department with this name already exists"));
    const dept = await Department.create({ orgId: req.user.orgId, ...req.body });
    await audit.record({ orgId: req.user.orgId, actorId: req.user.id, actorRole: req.user.role, action: "department.create", resource: "department", resourceId: String(dept._id) });
    res.status(201).json({ department: dept });
  } catch (e) { next(e); }
}

async function update(req, res, next) {
  try {
    const dept = await Department.findOneAndUpdate({ _id: req.params.id, orgId: req.user.orgId }, req.body, { new: true });
    if (!dept) return next(notFound("department not found"));
    await audit.record({ orgId: req.user.orgId, actorId: req.user.id, actorRole: req.user.role, action: "department.update", resource: "department", resourceId: String(dept._id), meta: req.body });
    res.json({ department: dept });
  } catch (e) { next(e); }
}

async function remove(req, res, next) {
  try {
    const dept = await Department.findOneAndDelete({ _id: req.params.id, orgId: req.user.orgId });
    if (!dept) return next(notFound("department not found"));
    await audit.record({ orgId: req.user.orgId, actorId: req.user.id, actorRole: req.user.role, action: "department.delete", resource: "department", resourceId: String(dept._id) });
    res.status(204).end();
  } catch (e) { next(e); }
}

module.exports = { list, create, update, remove };
