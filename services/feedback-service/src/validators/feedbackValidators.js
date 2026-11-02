"use strict";
const { z } = require("zod");

const answerSchema = z.object({
  questionId: z.string().min(1),
  value: z.union([z.string().max(5000), z.number(), z.array(z.string().max(200)).max(20)]),
});

// Either surveyId+answers (a survey submission) or just a comment (the anonymous box) - not neither.
const submitFeedbackSchema = z.object({
  surveyId: z.string().min(1).optional(),
  answers: z.array(answerSchema).max(50).optional(),
  comment: z.string().trim().max(5000).optional(),
}).refine((v) => v.surveyId || (v.comment && v.comment.length > 0), {
  message: "either surveyId (with answers) or a non-empty comment is required",
});

const explorerQuerySchema = z.object({
  surveyId: z.string().optional(),
  departmentId: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

module.exports = { submitFeedbackSchema, explorerQuerySchema };
