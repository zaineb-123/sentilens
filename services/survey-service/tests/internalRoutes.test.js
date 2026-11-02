jest.mock("../src/services/surveyService");
const request = require("supertest");
const surveyService = require("../src/services/surveyService");
const { createApp } = require("../src/app");

const app = createApp();
beforeEach(() => jest.clearAllMocks());

it("rejects internal calls without the internal key", async () => {
  const res = await request(app).post("/internal/participation/check-and-record").send({});
  expect(res.status).toBe(401);
});

it("returns 409 without recording when the employee already participated (idempotency)", async () => {
  surveyService.getForEmployee.mockResolvedValue({ status: "published" });
  surveyService.hasParticipated.mockResolvedValue(true);
  const res = await request(app).post("/internal/participation/check-and-record")
    .set("X-Internal-Key", "test-internal-key").send({ surveyId: "s1", userId: "u1", orgId: "org1" });
  expect(res.status).toBe(409);
  expect(surveyService.recordParticipation).not.toHaveBeenCalled();
});

it("records participation and returns the survey status for a first submission", async () => {
  surveyService.getForEmployee.mockResolvedValue({ status: "published" });
  surveyService.hasParticipated.mockResolvedValue(false);
  surveyService.recordParticipation.mockResolvedValue();
  const res = await request(app).post("/internal/participation/check-and-record")
    .set("X-Internal-Key", "test-internal-key").send({ surveyId: "s1", userId: "u1", orgId: "org1" });
  expect(res.status).toBe(201);
  expect(res.body).toEqual({ ok: true, surveyStatus: "published" });
});
