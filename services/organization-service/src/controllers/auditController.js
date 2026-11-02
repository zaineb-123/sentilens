"use strict";
const AuditLog = require("../models/AuditLog");

async function list(req, res, next) {
  try {
    const { action, resource, from, to, limit, cursor } = req.query;
    const filter = { orgId: req.user.orgId };
    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (from || to) filter.at = { ...(from && { $gte: new Date(from) }), ...(to && { $lte: new Date(to) }) };
    if (cursor) filter._id = { $lt: cursor };
    const logs = await AuditLog.find(filter).sort({ _id: -1 }).limit(limit);
    const nextCursor = logs.length === limit ? String(logs[logs.length - 1]._id) : null;
    res.json({ logs, nextCursor });
  } catch (e) { next(e); }
}

module.exports = { list };
