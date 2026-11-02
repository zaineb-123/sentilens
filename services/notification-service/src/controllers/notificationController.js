"use strict";
const notificationService = require("../services/notificationService");

async function list(req, res, next) {
  try {
    const items = await notificationService.listForUser(req.user.orgId, req.user.id, { unreadOnly: req.query.unread === "true" });
    res.json({ notifications: items });
  } catch (e) { next(e); }
}

async function markRead(req, res, next) {
  try {
    const { notFound } = require("@sentilens/shared");
    const n = await notificationService.markRead(req.user.orgId, req.user.id, req.params.id);
    if (!n) return next(notFound("notification not found"));
    res.json({ notification: n });
  } catch (e) { next(e); }
}

async function unreadCount(req, res, next) {
  try { res.json({ count: await notificationService.unreadCount(req.user.orgId, req.user.id) }); } catch (e) { next(e); }
}

module.exports = { list, markRead, unreadCount };
