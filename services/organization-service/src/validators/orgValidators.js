"use strict";
const { z } = require("zod");

const createOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(200),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/).min(2).max(60),
});

const updateSettingsSchema = z.object({
  minGroupSize: z.number().int().min(3).max(1000).optional(),
  allowAnonymousBox: z.boolean().optional(),
  showOrgResultsToEmployees: z.boolean().optional(),
  languages: z.array(z.enum(["fr", "en", "ar"])).min(1).optional(),
  retentionDays: z.number().int().min(30).max(3650).optional(),
});

const createDepartmentSchema = z.object({ name: z.string().trim().min(2).max(120) });
const updateDepartmentSchema = createDepartmentSchema.partial();

const upsertEmployeeProfileSchema = z.object({
  userId: z.string().min(1),
  departmentId: z.string().nullable().optional(),
  locale: z.enum(["fr", "en", "ar"]).optional(),
});

const auditLogQuerySchema = z.object({
  action: z.string().optional(),
  resource: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  cursor: z.string().optional(),
});

module.exports = {
  createOrganizationSchema, updateSettingsSchema, createDepartmentSchema,
  updateDepartmentSchema, upsertEmployeeProfileSchema, auditLogQuerySchema,
};
