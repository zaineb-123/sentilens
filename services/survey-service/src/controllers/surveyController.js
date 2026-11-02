"use strict";
const surveyService = require("../services/surveyService");

async function create(req, res, next) {
  try { res.status(201).json({ survey: await surveyService.create(req.user.orgId, req.user.id, req.body) }); } catch (e) { next(e); }
}
async function update(req, res, next) {
  try { res.json({ survey: await surveyService.update(req.user.orgId, req.params.id, req.body) }); } catch (e) { next(e); }
}
async function remove(req, res, next) {
  try { await surveyService.remove(req.user.orgId, req.params.id); res.status(204).end(); } catch (e) { next(e); }
}
async function publish(req, res, next) {
  try { res.json({ survey: await surveyService.publish(req.user.orgId, req.params.id) }); } catch (e) { next(e); }
}
async function close(req, res, next) {
  try { res.json({ survey: await surveyService.close(req.user.orgId, req.params.id) }); } catch (e) { next(e); }
}
async function get(req, res, next) {
  try { res.json({ survey: await surveyService.get(req.user.orgId, req.params.id) }); } catch (e) { next(e); }
}
async function listForHr(req, res, next) {
  try { res.json({ surveys: await surveyService.listForHr(req.user.orgId, req.query) }); } catch (e) { next(e); }
}
async function listForEmployee(req, res, next) {
  try {
    const deptId = req.headers["x-department-id"] || null; // set by the Gateway from the Organization Service
    res.json({ surveys: await surveyService.listForEmployee(req.user.orgId, deptId) });
  } catch (e) { next(e); }
}
async function getForEmployee(req, res, next) {
  try {
    const deptId = req.headers["x-department-id"] || null;
    res.json({ survey: await surveyService.getForEmployee(req.user.orgId, req.params.id, deptId) });
  } catch (e) { next(e); }
}
async function myParticipations(req, res, next) {
  try { res.json({ participations: await surveyService.myParticipations(req.user.id) }); } catch (e) { next(e); }
}
async function participationStats(req, res, next) {
  try { res.json(await surveyService.participationStats(req.user.orgId, req.params.id)); } catch (e) { next(e); }
}

module.exports = {
  create, update, remove, publish, close, get, listForHr, listForEmployee,
  getForEmployee, myParticipations, participationStats,
};
