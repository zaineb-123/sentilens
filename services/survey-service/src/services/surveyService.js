"use strict";
const Survey = require("../models/Survey");
const Participation = require("../models/Participation");
const { ApiError, notFound, forbidden } = require("@sentilens/shared");

function assertOwnedByOrg(survey, orgId) {
  if (!survey || String(survey.orgId) !== String(orgId)) throw notFound("survey not found");
  return survey;
}

async function create(orgId, createdBy, payload) {
  const questions = (payload.questions || []).map((q, i) => ({ ...q, order: q.order ?? i }));
  return Survey.create({ ...payload, questions, orgId, createdBy, status: "draft" });
}

async function update(orgId, id, payload) {
  const survey = assertOwnedByOrg(await Survey.findById(id), orgId);
  if (survey.status !== "draft") throw new ApiError(409, "SURVEY_NOT_EDITABLE", "only draft surveys can be edited");
  Object.assign(survey, payload);
  await survey.save();
  return survey;
}

async function remove(orgId, id) {
  const survey = assertOwnedByOrg(await Survey.findById(id), orgId);
  if (survey.status === "published") throw new ApiError(409, "SURVEY_NOT_EDITABLE", "close the survey before deleting it");
  await survey.deleteOne();
}

async function publish(orgId, id) {
  const survey = assertOwnedByOrg(await Survey.findById(id), orgId);
  if (survey.status !== "draft") throw new ApiError(409, "INVALID_TRANSITION", "only a draft survey can be published");
  if (survey.questions.length === 0) throw new ApiError(422, "EMPTY_SURVEY", "a survey needs at least one question before publishing");
  survey.status = "published";
  await survey.save();
  return survey;
}

async function close(orgId, id) {
  const survey = assertOwnedByOrg(await Survey.findById(id), orgId);
  if (survey.status !== "published") throw new ApiError(409, "INVALID_TRANSITION", "only a published survey can be closed");
  survey.status = "closed";
  await survey.save();
  return survey;
}

async function get(orgId, id) {
  return assertOwnedByOrg(await Survey.findById(id), orgId);
}

async function listForHr(orgId, { status } = {}) {
  const filter = { orgId };
  if (status) filter.status = status;
  return Survey.find(filter).sort({ createdAt: -1 });
}

/** Employees only ever see published surveys targeted at their department (or the whole org). */
async function listForEmployee(orgId, departmentId) {
  const now = new Date();
  const filter = {
    orgId, status: "published",
    $and: [
      { $or: [{ opensAt: null }, { opensAt: { $lte: now } }] },
      { $or: [{ closesAt: null }, { closesAt: { $gte: now } }] },
      { $or: [{ targetDepartmentIds: { $size: 0 } }, ...(departmentId ? [{ targetDepartmentIds: departmentId }] : [])] },
    ],
  };
  return Survey.find(filter).sort({ createdAt: -1 });
}

async function getForEmployee(orgId, id, departmentId) {
  const survey = assertOwnedByOrg(await Survey.findById(id), orgId);
  if (survey.status !== "published") throw notFound("survey not found");
  const targeted = survey.targetDepartmentIds.length === 0
    || (departmentId && survey.targetDepartmentIds.some((d) => String(d) === String(departmentId)));
  if (!targeted) throw forbidden("this survey is not available to your department");
  return survey;
}

/** Records that the user participated. Throws CONFLICT on a second attempt (unique index),
 *  which is exactly the "no double submission" rule. Never touches feedback content. */
async function recordParticipation(surveyId, userId) {
  try {
    await Participation.create({ surveyId, userId });
  } catch (e) {
    if (e.code === 11000) throw new ApiError(409, "ALREADY_PARTICIPATED", "you have already answered this survey");
    throw e;
  }
}

async function hasParticipated(surveyId, userId) {
  return Boolean(await Participation.findOne({ surveyId, userId }));
}

async function myParticipations(userId) {
  const rows = await Participation.find({ userId }).sort({ at: -1 });
  return rows.map((r) => ({ surveyId: r.surveyId, at: r.at }));
}

/** Aggregate-only: HR sees a count, never who participated. */
async function participationStats(orgId, surveyId) {
  const survey = assertOwnedByOrg(await Survey.findById(surveyId), orgId);
  const count = await Participation.countDocuments({ surveyId });
  return { surveyId, totalParticipants: count, status: survey.status };
}

module.exports = {
  create, update, remove, publish, close, get, listForHr, listForEmployee, getForEmployee,
  recordParticipation, hasParticipated, myParticipations, participationStats,
};
