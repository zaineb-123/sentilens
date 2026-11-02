"use strict";
function required(name, fallback) {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error("missing required env var " + name);
  return v;
}
module.exports = {
  port: parseInt(process.env.PORT || "4002", 10),
  mongoUri: required("MONGO_URI", "mongodb://localhost:27017/org_db"),
  jwtSecret: required("JWT_ACCESS_SECRET"),
  internalKey: process.env.INTERNAL_SERVICE_KEY || "",
  auditRetentionDays: parseInt(process.env.AUDIT_RETENTION_DAYS || "365", 10),
  defaultMinGroupSize: parseInt(process.env.DEFAULT_MIN_GROUP_SIZE || "5", 10),
};
