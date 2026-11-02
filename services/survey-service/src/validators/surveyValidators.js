"use strict";
const { z } = require("zod");

const localizedText = z.object({ fr: z.string().max(2000).optional(), en: z.string().max(2000).optional(), ar: z.string().max(2000).optional() })
  .refine((v) => Object.values(v).some((s) => s && s.trim()), { message: "at least one language must be provided" });

const optionSchema = z.object({ key: z.string().trim().min(1).max(60), label: localizedText });

const questionSchema = z.object({
  order: z.number().int().min(0),
  type: z.enum(["likert", "single_choice", "multi_choice", "text"]),
  prompt: localizedText,
  options: z.array(optionSchema).min(2).max(20).optional(),
  required: z.boolean().optional().default(true),
  aspectHint: z.string().trim().min(1).max(60).nullable().optional(),
}).superRefine((q, ctx) => {
  const needsOptions = q.type === "single_choice" || q.type === "multi_choice";
  if (needsOptions && (!q.options || q.options.length < 2)) {
    ctx.addIssue({ code: "custom", path: ["options"], message: "single_choice/multi_choice questions need at least 2 options" });
  }
  if (!needsOptions && q.options && q.options.length > 0) {
    ctx.addIssue({ code: "custom", path: ["options"], message: `${q.type} questions must not define options` });
  }
});

const surveyShape = {
  title: localizedText,
  description: localizedText.optional(),
  targetDepartmentIds: z.array(z.string().min(1)).optional().default([]),
  opensAt: z.string().datetime().nullable().optional(),
  closesAt: z.string().datetime().nullable().optional(),
  questions: z.array(questionSchema).max(50).optional().default([]),
};
const datesOrdered = (s) => !s.opensAt || !s.closesAt || new Date(s.opensAt) < new Date(s.closesAt);
const dateOrderRefinement = [datesOrdered, { message: "opensAt must be before closesAt", path: ["closesAt"] }];

const createSurveySchema = z.object(surveyShape).refine(...dateOrderRefinement);
const updateSurveySchema = z.object(surveyShape).partial().refine(...dateOrderRefinement);

const answerSchema = z.object({
  questionId: z.string().min(1),
  value: z.union([z.string(), z.number(), z.array(z.string())]),
});

const submitParticipationSchema = z.object({ surveyId: z.string().min(1) });

module.exports = { createSurveySchema, updateSurveySchema, answerSchema, submitParticipationSchema, localizedText, questionSchema };
