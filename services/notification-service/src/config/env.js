"use strict";
function required(name, fallback) {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error("missing required env var " + name);
  return v;
}
module.exports = {
  port: parseInt(process.env.PORT || "4007", 10),
  mongoUri: required("MONGO_URI", "mongodb://localhost:27017/notification_db"),
  jwtSecret: required("JWT_ACCESS_SECRET"),
  internalKey: process.env.INTERNAL_SERVICE_KEY || "",
  smtp: {
    host: process.env.SMTP_HOST || "",
    port: parseInt(process.env.SMTP_PORT || "1025", 10),
    from: process.env.SMTP_FROM || "SentiLens <no-reply@sentilens.local>",
    secure: process.env.SMTP_SECURE === "true",
  },
};
