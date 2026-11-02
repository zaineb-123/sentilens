"use strict";
const env = require("../config/env");

let transporter = null;
function getTransporter() {
  if (!env.smtp.host) return null;
  if (!transporter) {
    const nodemailer = require("nodemailer");
    transporter = nodemailer.createTransport({ host: env.smtp.host, port: env.smtp.port, secure: env.smtp.secure });
  }
  return transporter;
}

/**
 * Optional: only sends if SMTP_HOST is configured (e.g. Mailpit in docker-compose for local
 * demos). Never throws - a broken mail server must not break in-app notifications, which are
 * the primary channel (see docs/notifications.md).
 */
async function sendEmail({ to, subject, text }) {
  const t = getTransporter();
  if (!t || !to) return { sent: false };
  try {
    await t.sendMail({ from: env.smtp.from, to, subject, text });
    return { sent: true };
  } catch (err) {
    console.error("email send failed", err.message);
    return { sent: false, error: err.message };
  }
}

module.exports = { sendEmail };
