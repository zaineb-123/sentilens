"use strict";
function required(name, fallback) {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error("missing required env var " + name);
  return v;
}
module.exports = {
  port: parseInt(process.env.PORT || "4006", 10),
  mongoUri: required("MONGO_URI", "mongodb://localhost:27017/analytics_db"),
  jwtSecret: required("JWT_ACCESS_SECRET"),
  internalKey: process.env.INTERNAL_SERVICE_KEY || "",
  organizationServiceUrl: process.env.ORGANIZATION_SERVICE_URL || "http://organization-service:4002",
  notificationServiceUrl: process.env.NOTIFICATION_SERVICE_URL || "",
  authServiceUrl: process.env.AUTH_SERVICE_URL || "http://auth-service:4001",
  alertMinSampleSize: parseInt(process.env.ALERT_MIN_SAMPLE_SIZE || "10", 10),
  alertMinChangePct: parseFloat(process.env.ALERT_MIN_CHANGE_PCT || "15", 10), // percentage points
};
