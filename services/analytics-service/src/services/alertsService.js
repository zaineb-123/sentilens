"use strict";
const DailyStat = require("../models/DailyStat");
const Alert = require("../models/Alert");
const env = require("../config/env");
const authClient = require("./authClient");
const notificationClient = require("./notificationClient");

function pct(n, total) {
  return total > 0 ? Math.round((n / total) * 1000) / 10 : 0;
}

/** Sums org-wide (departmentId=null) DailyStat rows within [from, to) into per-aspect totals. */
async function aspectTotalsForPeriod(orgId, from, to) {
  const rows = await DailyStat.find({ orgId, departmentId: null, date: { $gte: from, $lt: to } }).lean();
  const totals = {};
  for (const row of rows) {
    const aspects = row.aspects instanceof Map ? row.aspects : new Map(Object.entries(row.aspects || {}));
    for (const [key, v] of aspects.entries()) {
      const t = totals[key] || { mentions: 0, negative: 0 };
      t.mentions += v.mentions || 0;
      t.negative += v.negative || 0;
      totals[key] = t;
    }
  }
  return totals;
}

/**
 * Compares the last `days` to the `days` before that, org-wide, per aspect. Only reports a
 * DETECTED CHANGE in negative-mention share - never a claimed cause (see docs/analytics.md).
 * Requires at least alertMinSampleSize current-period mentions to avoid noisy small-sample alerts.
 */
async function detectForOrg(orgId, { days = 14, now = new Date() } = {}) {
  const currentFrom = new Date(now.getTime() - days * 86400000);
  const previousFrom = new Date(now.getTime() - 2 * days * 86400000);

  const [current, previous] = await Promise.all([
    aspectTotalsForPeriod(orgId, currentFrom, now),
    aspectTotalsForPeriod(orgId, previousFrom, currentFrom),
  ]);

  const results = [];
  for (const [aspectKey, cur] of Object.entries(current)) {
    if (cur.mentions < env.alertMinSampleSize) continue;
    const currentShare = pct(cur.negative, cur.mentions);
    const prev = previous[aspectKey] || { mentions: 0, negative: 0 };
    const previousShare = pct(prev.negative, prev.mentions);
    const changePct = Math.round((currentShare - previousShare) * 10) / 10;
    if (changePct < env.alertMinChangePct) continue;

    const severity = changePct >= 25 ? "critical" : "warning";
    const payload = {
      orgId, departmentId: null, type: "aspect_negative_trend", aspectKey,
      severity, metric: "negative_share", current: currentShare, previous: previousShare, changePct,
      period: { from: currentFrom, to: now, previousFrom, previousTo: currentFrom },
      sampleSize: cur.mentions,
    };

    const existing = await Alert.findOne({ orgId, departmentId: null, aspectKey, type: "aspect_negative_trend" }); // eslint-disable-line no-await-in-loop
    let alert;
    let isNew = false;
    if (!existing || existing.status === "resolved") {
      alert = await Alert.create({ ...payload, status: "new" }); // eslint-disable-line no-await-in-loop
      isNew = true;
    } else {
      Object.assign(existing, payload); // keep existing status (new/acknowledged) - do not re-notify
      alert = await existing.save(); // eslint-disable-line no-await-in-loop
    }
    if (isNew) {
      // Best-effort: a notification failure must never break alert detection itself.
      notifyHr(orgId, alert).catch(() => {});
    }
    results.push(alert);
  }
  return results;
}

async function notifyHr(orgId, alert) {
  const userIds = await authClient.listHrUserIds(orgId);
  await Promise.all(userIds.map((id) => notificationClient.notifyNewAlert(alert, id)));
}

async function list(orgId, { status } = {}) {
  const filter = { orgId };
  if (status) filter.status = status;
  return Alert.find(filter).sort({ createdAt: -1 });
}

async function acknowledge(orgId, id) {
  return Alert.findOneAndUpdate({ _id: id, orgId }, { status: "acknowledged" }, { new: true });
}

module.exports = { detectForOrg, list, acknowledge };
