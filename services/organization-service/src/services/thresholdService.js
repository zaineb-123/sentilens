"use strict";
const Organization = require("../models/Organization");

const DEFAULT_MIN_GROUP_SIZE = require("../config/env").defaultMinGroupSize;

/** Single source of truth for the k-anonymity threshold; Analytics Service calls this
 *  (via the internal API) instead of duplicating the default/floor logic. */
async function getMinGroupSize(orgId) {
  const org = await Organization.findById(orgId).select("settings.minGroupSize").lean();
  return Math.max(3, org?.settings?.minGroupSize ?? DEFAULT_MIN_GROUP_SIZE);
}

module.exports = { getMinGroupSize };
