"use strict";
module.exports = {
  openapi: "3.0.3",
  info: { title: "SentiLens Analytics Service", version: "1.0.0", description: "Aggregated sentiment, emotion, aspect and trend analytics with k-anonymity suppression, plus trend alerts. HR only." },
  servers: [{ url: "/api" }],
  paths: {
    "/analytics/overview": { get: { summary: "KPIs: total, sentiment %, top aspects" } },
    "/analytics/sentiment": { get: { summary: "Sentiment distribution" } },
    "/analytics/emotions": { get: { summary: "Emotion distribution" } },
    "/analytics/aspects": { get: { summary: "Aspect frequency and per-aspect sentiment" } },
    "/analytics/trends": { get: { summary: "Sentiment evolution over time" } },
    "/analytics/departments": { get: { summary: "Department comparison with complementary suppression" } },
    "/analytics/export": { get: { summary: "Export the current overview + aspect breakdown as CSV (respects k-anonymity suppression)" } },
    "/alerts": { get: { summary: "List trend alerts" } },
    "/alerts/{id}": { patch: { summary: "Acknowledge an alert" } },
  },
  components: { securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } } },
};
