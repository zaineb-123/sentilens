"use strict";
const mongoose = require("mongoose");
const { createApp } = require("./app");
const env = require("./config/env");
const DailyStat = require("./models/DailyStat");
const alertsService = require("./services/alertsService");

async function detectAllOrgs() {
  const orgIds = await DailyStat.distinct("orgId");
  for (const orgId of orgIds) {
    await alertsService.detectForOrg(orgId); // eslint-disable-line no-await-in-loop
  }
}

async function main() {
  await mongoose.connect(env.mongoUri);
  const app = createApp();
  app.listen(env.port, () => console.log(`analytics-service listening on ${env.port}`));
  setInterval(() => detectAllOrgs().catch((e) => console.error("alert detection failed", e.message)), 5 * 60 * 1000);
}

if (require.main === module) {
  main().catch((err) => { console.error("analytics-service failed to start", err); process.exit(1); });
}

module.exports = { main, detectAllOrgs };
