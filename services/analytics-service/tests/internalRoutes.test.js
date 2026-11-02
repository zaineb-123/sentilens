jest.mock("../src/services/ingestService");
jest.mock("../src/services/alertsService");
const request = require("supertest");
const ingestService = require("../src/services/ingestService");
const alertsService = require("../src/services/alertsService");
const { createApp } = require("../src/app");

const app = createApp();
beforeEach(() => jest.clearAllMocks());

it("rejects internal calls without the internal key", async () => {
  expect((await request(app).post("/internal/ingest").send({})).status).toBe(401);
});

it("ingests an analysis result", async () => {
  ingestService.ingest.mockResolvedValue({ alreadyIngested: false });
  const res = await request(app).post("/internal/ingest").set("X-Internal-Key", "test-internal-key").send({ feedbackId: "f1", orgId: "org1", sentiment: { label: "mixed" } });
  expect(res.status).toBe(202);
});

it("triggers alert detection for an org", async () => {
  alertsService.detectForOrg.mockResolvedValue([{ aspectKey: "workload" }]);
  const res = await request(app).post("/internal/alerts/detect").set("X-Internal-Key", "test-internal-key").send({ orgId: "org1" });
  expect(res.status).toBe(200);
  expect(res.body.alerts).toHaveLength(1);
});
