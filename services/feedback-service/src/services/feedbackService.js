"use strict";
const Feedback = require("../models/Feedback");
const { maskPii } = require("./piiMasking");
const { generateReceipt, hashReceipt, roundToDay } = require("./receiptService");
const surveyClient = require("./surveyClient");
const analysisClient = require("./analysisClient");
const { ApiError, notFound } = require("@sentilens/shared");

/**
 * Submits feedback. NEVER receives or stores userId/IP/user-agent - the caller (gateway
 * controller) only ever passes what belongs in the Feedback DB.
 */
async function submit({ orgId, userId, departmentId, surveyId, answers, comment }) {
  const masked = maskPii(comment || "");

  if (surveyId) {
    // Participation check-and-record happens in the Survey Service, which owns that data
    // and enforces "no double submission" - this call carries userId ONLY to that service,
    // never into the Feedback document created below.
    await surveyClient.checkAndRecordParticipation({ orgId, userId, departmentId, surveyId });
  }

  const receipt = generateReceipt();
  const doc = await Feedback.create({
    orgId, departmentId: departmentId || null, surveyId: surveyId || null,
    source: surveyId ? "survey" : "anonymous_box",
    answers: answers || [],
    comment: masked.text,
    receiptHash: receipt.hash,
    day: roundToDay(),
  });

  analysisClient.enqueue(doc).catch(() => {}); // best-effort; feedback is never lost if this fails (see docs/ai.md)
  return { feedbackId: doc._id, receiptCode: receipt.code };
}

async function statusByReceipt(orgId, code) {
  const feedback = await Feedback.findOne({ orgId, receiptHash: hashReceipt(code) }).select("analysisStatus createdAt");
  if (!feedback) throw notFound("no feedback found for this receipt code");
  return { analysisStatus: feedback.analysisStatus, submittedAt: feedback.createdAt };
}

module.exports = { submit, statusByReceipt };
