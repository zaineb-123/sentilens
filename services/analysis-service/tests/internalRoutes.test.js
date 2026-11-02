jest.mock("../src/services/worker");
jest.mock("../src/models/Analysis");
jest.mock("../src/models/Job");
const request = require("supertest");
const worker = require("../src/services/worker");
const Analysis = require("../src/models/Analysis");
const Job = require("../src/models/Job");
const { createApp } = require("../src/app");

const app = createApp();
beforeEach(() => jest.clearAllMocks());

it("rejects any internal call without the internal key (whole service is internal-only)", async () => {
  expect((await request(app).post("/internal/run-once")).status).toBe(401);
  expect((await request(app).get("/internal/analyses/f1")).status).toBe(401);
});

it("/internal/jobs responds immediately (202) and triggers processing asynchronously", async () => {
  worker.runOnce.mockResolvedValue({ claimed: 1, results: [{ ok: true }] });
  const res = await request(app).post("/internal/jobs").set("X-Internal-Key", "test-internal-key");
  expect(res.status).toBe(202);
  expect(res.body).toEqual({ accepted: true });
});

it("/internal/run-once runs synchronously and returns the summary", async () => {
  worker.runOnce.mockResolvedValue({ claimed: 3, results: [{ ok: true }, { ok: true }, { ok: false, exhausted: true }] });
  const res = await request(app).post("/internal/run-once").set("X-Internal-Key", "test-internal-key").send({ limit: 3 });
  expect(res.status).toBe(200);
  expect(res.body.claimed).toBe(3);
  expect(worker.runOnce).toHaveBeenCalledWith(3);
});

it("fetches a stored analysis by feedbackId", async () => {
  Analysis.findOne.mockResolvedValue({ feedbackId: "f1", sentiment: { label: "mixed" } });
  const res = await request(app).get("/internal/analyses/f1").set("X-Internal-Key", "test-internal-key");
  expect(res.status).toBe(200);
  expect(res.body.analysis.sentiment.label).toBe("mixed");
});

it("fetches job status (attempts/errors) by feedbackId", async () => {
  Job.findOne.mockResolvedValue({ feedbackId: "f1", status: "failed", attempts: 5, lastError: "ai-service error 503" });
  const res = await request(app).get("/internal/jobs/f1").set("X-Internal-Key", "test-internal-key");
  expect(res.status).toBe(200);
  expect(res.body.job.status).toBe("failed");
});

it("serves an OpenAPI document", async () => {
  const res = await request(app).get("/openapi.json");
  expect(res.body.info.title).toMatch(/Analysis Service/);
});
