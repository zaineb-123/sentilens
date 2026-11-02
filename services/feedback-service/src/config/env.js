"use strict";
function required(name, fallback) {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error("missing required env var " + name);
  return v;
}
module.exports = {
  port: parseInt(process.env.PORT || "4004", 10),
  mongoUri: required("MONGO_URI", "mongodb://localhost:27017/feedback_db"),
  jwtSecret: required("JWT_ACCESS_SECRET"),
  internalKey: process.env.INTERNAL_SERVICE_KEY || "",
  maxCsvRows: parseInt(process.env.MAX_CSV_ROWS || "5000", 10),
  maxCsvBytes: parseInt(process.env.MAX_CSV_BYTES || String(5 * 1024 * 1024), 10),
};
