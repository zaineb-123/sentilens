"use strict";
const surveyService = require("../services/surveyService");
const Survey = require("../models/Survey");

/** Called by Feedback Service when a survey-linked feedback is submitted: validates the
 *  survey is live, records participation (idempotency/double-submit protection), and hands
 *  back just enough survey metadata (aspectHints) for the Analysis Service - never the
 *  participation list itself. */
async function checkAndRecord(req, res, next) {
  try {
    const { surveyId, userId, departmentId } = req.body;
    const survey = await surveyService.getForEmployee(req.body.orgId, surveyId, departmentId);
    const already = await surveyService.hasParticipated(surveyId, userId);
    if (already) return res.status(409).json({ error: { code: "ALREADY_PARTICIPATED", message: "already answered" } });
    await surveyService.recordParticipation(surveyId, userId);
    res.status(201).json({ ok: true, surveyStatus: survey.status });
  } catch (e) { next(e); }
}

async function getById(req, res, next) {
  try {
    const survey = await Survey.findById(req.params.id);
    res.json({ survey });
  } catch (e) { next(e); }
}

module.exports = { checkAndRecord, getById };
