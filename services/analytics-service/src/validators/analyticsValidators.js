"use strict";
const { z } = require("zod");

const filtersSchema = z.object({
  departmentId: z.string().optional(),
  surveyId: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

const departmentComparisonSchema = filtersSchema.extend({
  departmentIds: z.string().min(1), // comma-separated
});

const alertsQuerySchema = z.object({ status: z.enum(["new", "acknowledged", "resolved"]).optional() });

module.exports = { filtersSchema, departmentComparisonSchema, alertsQuerySchema };
