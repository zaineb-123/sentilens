"use strict";

/**
 * Best-effort PII scrubbing of free-text comments before they are stored, on top of the
 * structural anonymity guarantees (no userId/IP/UA). This is a safety net, not a promise
 * of perfect redaction - comments can still contain indirect identifiers (see docs/privacy.md).
 */
const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
// Sequences of 7+ digits, optionally grouped with spaces/dots/dashes and an optional leading +.
const PHONE_RE = /(?:\+?\d[\s.-]?){7,}\d/g;
const URL_RE = /https?:\/\/[^\s]+/gi;

function maskPii(text) {
  if (!text) return { text: "", masked: false };
  let masked = false;
  const replaced = text
    .replace(EMAIL_RE, () => { masked = true; return "[email]"; })
    .replace(URL_RE, () => { masked = true; return "[link]"; })
    .replace(PHONE_RE, () => { masked = true; return "[phone]"; });
  return { text: replaced, masked };
}

module.exports = { maskPii };
