"use strict";
const crypto = require("crypto");

/** Human-typeable code shown to the employee once; only its hash is ever stored. */
function generateReceipt() {
  const code = crypto.randomBytes(6).toString("hex").toUpperCase(); // e.g. "3F9A0C21B7E4"
  const hash = crypto.createHash("sha256").update(code).digest("hex");
  return { code, hash };
}

function hashReceipt(code) {
  return crypto.createHash("sha256").update(code.toUpperCase().trim()).digest("hex");
}

/** Rounds a timestamp down to midnight UTC of its day (privacy: no exact submission time). */
function roundToDay(date = new Date()) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

module.exports = { generateReceipt, hashReceipt, roundToDay };
