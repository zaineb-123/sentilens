"use strict";
const { parse } = require("csv-parse/sync");
const Feedback = require("../models/Feedback");
const ImportBatch = require("../models/ImportBatch");
const { maskPii } = require("./piiMasking");
const { generateReceipt, roundToDay } = require("./receiptService");
const analysisClient = require("./analysisClient");
const { badRequest } = require("@sentilens/shared");

const REQUIRED_COLUMNS = ["id", "comment", "date", "department"];
const MAX_COMMENT_LEN = 5000;

function validateRow(row, index) {
  const errors = [];
  if (!row.id || !String(row.id).trim()) errors.push("missing id");
  if (!row.comment || !String(row.comment).trim()) errors.push("missing comment");
  else if (row.comment.length > MAX_COMMENT_LEN) errors.push(`comment exceeds ${MAX_COMMENT_LEN} characters`);
  if (row.date && Number.isNaN(Date.parse(row.date))) errors.push("invalid date");
  if (!row.department || !String(row.department).trim()) errors.push("missing department");
  return errors;
}

/**
 * Parses, validates, masks and stores a CSV of feedback rows. Department NAMES are resolved
 * to ids via the Organization Service (this service does not own department data). Rows that
 * reference an unknown department are recorded as invalid rather than silently dropped.
 */
async function importCsv({ orgId, createdBy, filename, buffer, resolveDepartmentIds }) {
  let records;
  try {
    records = parse(buffer, { columns: true, skip_empty_lines: true, trim: true, bom: true });
  } catch (e) {
    throw badRequest("could not parse CSV file: " + e.message);
  }
  if (records.length === 0) throw badRequest("CSV file has no data rows");

  const header = Object.keys(records[0]);
  const missingCols = REQUIRED_COLUMNS.filter((c) => !header.includes(c));
  if (missingCols.length > 0) throw badRequest(`CSV is missing required column(s): ${missingCols.join(", ")}`);

  const batch = await ImportBatch.create({ orgId, filename, createdBy, total: records.length, status: "processing" });

  const departmentNames = [...new Set(records.map((r) => (r.department || "").trim()).filter(Boolean))];
  const departmentMap = await resolveDepartmentIds(departmentNames); // { name: id }

  const errors = [];
  let valid = 0;
  const toInsert = [];
  for (let i = 0; i < records.length; i += 1) {
    const row = records[i];
    const rowErrors = validateRow(row, i);
    const deptId = departmentMap[row.department?.trim()];
    if (row.department && !deptId) rowErrors.push(`unknown department "${row.department}"`);
    if (rowErrors.length > 0) {
      errors.push({ row: i + 2, message: rowErrors.join("; ") }); // +2: header row + 1-based index
      continue;
    }
    const masked = maskPii(row.comment);
    const receipt = generateReceipt();
    toInsert.push({
      orgId, departmentId: deptId, source: "csv_import", batchId: batch._id,
      comment: masked.text, receiptHash: receipt.hash,
      day: roundToDay(row.date ? new Date(row.date) : new Date()),
    });
    valid += 1;
  }

  const inserted = toInsert.length > 0 ? await Feedback.insertMany(toInsert) : [];
  batch.valid = valid;
  batch.invalid = errors.length;
  batch.errors = errors.slice(0, 200); // cap stored errors; the batch summary still reports the true count
  batch.status = "done";
  await batch.save();

  inserted.forEach((doc) => analysisClient.enqueue(doc).catch(() => {}));

  return batch;
}

async function getBatch(orgId, id) {
  return ImportBatch.findOne({ _id: id, orgId });
}

module.exports = { importCsv, getBatch, REQUIRED_COLUMNS };
