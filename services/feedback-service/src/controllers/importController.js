"use strict";
const csvImportService = require("../services/csvImportService");
const orgClient = require("../services/orgClient");
const { badRequest, notFound } = require("@sentilens/shared");

async function upload(req, res, next) {
  try {
    if (!req.file) return next(badRequest("no CSV file was uploaded (field name: file)"));
    const batch = await csvImportService.importCsv({
      orgId: req.user.orgId, createdBy: req.user.id, filename: req.file.originalname,
      buffer: req.file.buffer,
      resolveDepartmentIds: (names) => orgClient.resolveDepartmentIds(req.user.orgId, names),
    });
    res.status(201).json({ batch });
  } catch (e) { next(e); }
}

async function getBatch(req, res, next) {
  try {
    const batch = await csvImportService.getBatch(req.user.orgId, req.params.id);
    if (!batch) return next(notFound("import batch not found"));
    res.json({ batch });
  } catch (e) { next(e); }
}

module.exports = { upload, getBatch };
