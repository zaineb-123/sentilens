jest.mock("../src/services/feedbackService");
jest.mock("../src/services/explorerService");
const request = require("supertest");
const feedbackService = require("../src/services/feedbackService");
const explorerService = require("../src/services/explorerService");
const { createApp } = require("../src/app");
const { tokenFor } = require("./helpers");

const app = createApp();
const employeeAuth = { Authorization: `Bearer ${tokenFor({ role: "employee" })}` };
const hrAuth = { Authorization: `Bearer ${tokenFor({ role: "hr" })}` };

beforeEach(() => jest.clearAllMocks());

describe("RBAC", () => {
  it("hr cannot submit feedback (that is an employee action)", async () => {
    const res = await request(app).post("/api/feedback").set(hrAuth).send({ comment: "hello" });
    expect(res.status).toBe(403);
  });

  it("employee cannot browse the feedback explorer", async () => {
    const res = await request(app).get("/api/feedback").set(employeeAuth);
    expect(res.status).toBe(403);
  });

  it("unauthenticated submission is rejected", async () => {
    expect((await request(app).post("/api/feedback").send({ comment: "hello" })).status).toBe(401);
  });
});

describe("submission validation", () => {
  it("rejects a submission with neither surveyId nor a comment", async () => {
    const res = await request(app).post("/api/feedback").set(employeeAuth).send({});
    expect(res.status).toBe(422);
    expect(feedbackService.submit).not.toHaveBeenCalled();
  });

  it("accepts an anonymous-box comment with no surveyId", async () => {
    feedbackService.submit.mockResolvedValue({ receiptCode: "ABCDEF123456", feedbackId: "f1" });
    const res = await request(app).post("/api/feedback").set(employeeAuth).send({ comment: "The team is great." });
    expect(res.status).toBe(201);
    expect(res.body.receiptCode).toBe("ABCDEF123456");
  });

  it("forwards the gateway-provided department header, never trusting the client body for it", async () => {
    feedbackService.submit.mockResolvedValue({ receiptCode: "X", feedbackId: "f1" });
    await request(app).post("/api/feedback").set(employeeAuth).set("X-Department-Id", "dept-9")
      .send({ comment: "fine", departmentId: "dept-CLIENT-SUPPLIED" });
    expect(feedbackService.submit).toHaveBeenCalledWith(expect.objectContaining({ departmentId: "dept-9" }));
  });
});

describe("HR explorer returns whatever the service decides, including suppression", () => {
  it("surfaces a suppression response with 200 (not an error) so the UI can render a notice", async () => {
    explorerService.explore.mockResolvedValue({ suppressed: true, reason: "Not enough responses to protect anonymity.", minGroupSize: 5, count: 3, items: [] });
    const res = await request(app).get("/api/feedback").set(hrAuth).query({ departmentId: "d1" });
    expect(res.status).toBe(200);
    expect(res.body.suppressed).toBe(true);
  });
});

describe("system endpoints", () => {
  it("health is public", async () => { expect((await request(app).get("/health")).status).toBe(200); });
  it("serves OpenAPI", async () => {
    const res = await request(app).get("/openapi.json");
    expect(res.body.info.title).toMatch(/Feedback Service/);
  });
});
