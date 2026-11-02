"use strict";
const mongoose = require("mongoose");
const { createApp } = require("./app");
const worker = require("./services/worker");
const env = require("./config/env");

async function main() {
  await mongoose.connect(env.mongoUri);
  const app = createApp();
  app.listen(env.port, () => console.log(`analysis-service listening on ${env.port}`));

  // The durable polling loop: guarantees pending feedback is eventually processed even if
  // every push-based /internal/jobs hint was missed (network blip, restart, etc).
  setInterval(() => {
    worker.runOnce().catch((err) => console.error("analysis poll cycle failed", err.message));
  }, env.pollIntervalMs);
}

if (require.main === module) {
  main().catch((err) => { console.error("analysis-service failed to start", err); process.exit(1); });
}

module.exports = { main };
