"use strict";
const Notification = require("../models/Notification");
const mailer = require("./mailerService");

/** Creates an in-app notification and, if an email is supplied and SMTP is configured, also
 *  best-effort sends an email (see mailerService.js). Used by internal callers only - HR/admin
 *  users never author notifications for themselves. */
async function create({ orgId, recipientUserId, type, refId = null, title, message = "", email = null }) {
  const notification = await Notification.create({ orgId, recipientUserId, type, refId, title, message });
  if (email) {
    const result = await mailer.sendEmail({ to: email, subject: title, text: message });
    if (result.sent) {
      notification.emailSentAt = new Date();
      await notification.save();
    }
  }
  return notification;
}

async function listForUser(orgId, recipientUserId, { unreadOnly } = {}) {
  const filter = { orgId, recipientUserId };
  if (unreadOnly) filter.read = false;
  return Notification.find(filter).sort({ createdAt: -1 }).limit(100);
}

async function markRead(orgId, recipientUserId, id) {
  return Notification.findOneAndUpdate({ _id: id, orgId, recipientUserId }, { read: true }, { new: true });
}

async function unreadCount(orgId, recipientUserId) {
  return Notification.countDocuments({ orgId, recipientUserId, read: false });
}

module.exports = { create, listForUser, markRead, unreadCount };
