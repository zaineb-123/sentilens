"use strict";

function required(name, fallback) {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error("missing required env var " + name);
  return v;
}

module.exports = {
  port: parseInt(process.env.PORT || "4001", 10),
  mongoUri: required("MONGO_URI", "mongodb://localhost:27017/auth_db"),
  jwtSecret: required("JWT_ACCESS_SECRET"),
  refreshSecret: required("JWT_REFRESH_SECRET"),
  internalKey: process.env.INTERNAL_SERVICE_KEY || "",
  refreshTtlDays: parseInt(process.env.REFRESH_TTL_DAYS || "30", 10),
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || "12", 10),
  nodeEnv: process.env.NODE_ENV || "development",
};
