"use strict";
const alertsService = require("../services/alertsService");
const { notFound } = require("@sentilens/shared");

async function list(req, res, next) {
  try { res.json({ alerts: await alertsService.list(req.user.orgId, req.query) }); } catch (e) { next(e); }
}

async function acknowledge(req, res, next) {
  try {
    const alert = await alertsService.acknowledge(req.user.orgId, req.params.id);
    if (!alert) return next(notFound("alert not found"));
    res.json({ alert });
  } catch (e) { next(e); }
}

module.exports = { list, acknowledge };
