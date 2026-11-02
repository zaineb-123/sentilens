"use strict";
const mongoose = require("mongoose");
const { createApp } = require("./app");
const env = require("./config/env");

async function main() {
  await mongoose.connect(env.mongoUri);
  const app = createApp();
  app.listen(env.port, () => console.log(`auth-service listening on ${env.port}`));
}

if (require.main === module) {
  main().catch((err) => { console.error("auth-service failed to start", err); process.exit(1); });
}

module.exports = { main };
