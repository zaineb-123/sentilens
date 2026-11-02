"use strict";
const feedbackService = require("../services/feedbackService");
const explorerService = require("../services/explorerService");

async function submit(req, res, next) {
  try {
    // departmentId comes from the Gateway (forwarded from Organization Service via the
    // employee's profile), never from the request body - the employee cannot claim a
    // department for themselves, which would let them target a small-group deanonymization.
    const departmentId = req.headers["x-department-id"] || null;
    const result = await feedbackService.submit({
      orgId: req.user.orgId, userId: req.user.id, departmentId,
      surveyId: req.body.surveyId, answers: req.body.answers, comment: req.body.comment,
    });
    res.status(201).json({ receiptCode: result.receiptCode, feedbackId: result.feedbackId });
  } catch (e) { next(e); }
}

async function statusByReceipt(req, res, next) {
  try { res.json(await feedbackService.statusByReceipt(req.user.orgId, req.params.code)); } catch (e) { next(e); }
}

async function explore(req, res, next) {
  try { res.json(await explorerService.explore(req.user.orgId, req.query)); } catch (e) { next(e); }
}

module.exports = { submit, statusByReceipt, explore };
