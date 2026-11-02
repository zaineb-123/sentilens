try {
  require("dotenv").config({
    path: require("path").resolve(__dirname, "../../../.env"),
  });
} catch (e) {}
"use strict";
const { createApp } = require("./app");
const env = require("./config/env");

function main() {
  const app = createApp();
  app.listen(env.port, () => console.log(`api-gateway listening on ${env.port}`));
}

if (require.main === module) {
  main();
}

module.exports = { main };
