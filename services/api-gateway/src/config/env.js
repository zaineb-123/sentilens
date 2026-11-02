"use strict";
function required(name, fallback) {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error("missing required env var " + name);
  return v;
}
module.exports = {
  port: parseInt(process.env.PORT || "8080", 10),
  jwtSecret: required("JWT_ACCESS_SECRET"),
  corsOrigin: process.env.CORS_ORIGIN || true,
  services: {
    auth: required("AUTH_SERVICE_URL", "http://auth-service:4001"),
    organization: required("ORGANIZATION_SERVICE_URL", "http://organization-service:4002"),
    survey: required("SURVEY_SERVICE_URL", "http://survey-service:4003"),
    feedback: required("FEEDBACK_SERVICE_URL", "http://feedback-service:4004"),
    analytics: required("ANALYTICS_SERVICE_URL", "http://analytics-service:4006"),
    notification: required("NOTIFICATION_SERVICE_URL", "http://notification-service:4007"),
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10),
    limit: parseInt(process.env.RATE_LIMIT_MAX || "600", 10),
  },
};
