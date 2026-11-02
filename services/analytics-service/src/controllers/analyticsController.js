"use strict";
const statsService = require("../services/statsService");
const { buildReportCsv } = require("../services/csvExportService");

async function overview(req, res, next) {
  try { res.json(await statsService.overview(req.user.orgId, req.query)); } catch (e) { next(e); }
}
async function sentiment(req, res, next) {
  try { res.json(await statsService.sentimentBreakdown(req.user.orgId, req.query)); } catch (e) { next(e); }
}
async function emotions(req, res, next) {
  try { res.json(await statsService.emotionBreakdown(req.user.orgId, req.query)); } catch (e) { next(e); }
}
async function aspects(req, res, next) {
  try { res.json(await statsService.aspectBreakdown(req.user.orgId, req.query)); } catch (e) { next(e); }
}
async function trends(req, res, next) {
  try { res.json(await statsService.trendSeries(req.user.orgId, req.query)); } catch (e) { next(e); }
}
async function departments(req, res, next) {
  try {
    const ids = req.query.departmentIds.split(",").map((s) => s.trim()).filter(Boolean);
    res.json(await statsService.departmentComparison(req.user.orgId, req.query, ids));
  } catch (e) { next(e); }
}

async function exportCsv(req, res, next) {
  try {
    const overview = await statsService.overview(req.user.orgId, req.query);
    if (overview.privacy?.suppressed) {
      return res.status(200).json(overview);
    }
    const aspectData = await statsService.aspectBreakdown(req.user.orgId, req.query);
    const csv = buildReportCsv(overview, aspectData);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="sentilens-report-${new Date().toISOString().slice(0, 10)}.csv"`);
    res.send(csv);
  } catch (e) { next(e); }
}

module.exports = { overview, sentiment, emotions, aspects, trends, departments, exportCsv };
