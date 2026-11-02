jest.mock("../src/services/surveyService");
const request = require("supertest");
const surveyService = require("../src/services/surveyService");
const { createApp } = require("../src/app");
const { tokenFor } = require("./helpers");

const app = createApp();
const hrAuth = { Authorization: `Bearer ${tokenFor({ role: "hr" })}` };
const employeeAuth = { Authorization: `Bearer ${tokenFor({ role: "employee" })}` };

beforeEach(() => jest.clearAllMocks());

describe("RBAC", () => {
  it("employee cannot create a survey", async () => {
    const res = await request(app).post("/api/surveys").set(employeeAuth).send({ title: { en: "Q3 pulse" } });
    expect(res.status).toBe(403);
  });

  it("hr cannot hit the employee-only listing", async () => {
    const res = await request(app).get("/api/surveys/available").set(hrAuth);
    expect(res.status).toBe(403);
  });

  it("unauthenticated requests are rejected", async () => {
    expect((await request(app).get("/api/surveys")).status).toBe(401);
  });
});

describe("validation", () => {
  it("rejects a single_choice question with fewer than 2 options", async () => {
    const res = await request(app).post("/api/surveys").set(hrAuth).send({
      title: { en: "Q3 pulse" },
      questions: [{ order: 0, type: "single_choice", prompt: { en: "Pick one" }, options: [{ key: "a", label: { en: "A" } }] }],
    });
    expect(res.status).toBe(422);
  });

  it("rejects a text question that defines options", async () => {
    const res = await request(app).post("/api/surveys").set(hrAuth).send({
      title: { en: "Q3 pulse" },
      questions: [{ order: 0, type: "text", prompt: { en: "Comments?" }, options: [{ key: "a", label: { en: "A" } }] }],
    });
    expect(res.status).toBe(422);
  });

  it("rejects closesAt before opensAt", async () => {
    const res = await request(app).post("/api/surveys").set(hrAuth).send({
      title: { en: "Q3 pulse" }, opensAt: "2026-06-01T00:00:00.000Z", closesAt: "2026-05-01T00:00:00.000Z",
    });
    expect(res.status).toBe(422);
  });

  it("accepts a well-formed likert survey", async () => {
    surveyService.create.mockResolvedValue({ _id: "s1", status: "draft" });
    const res = await request(app).post("/api/surveys").set(hrAuth).send({
      title: { en: "Q3 pulse", fr: "Sondage T3" },
      questions: [{ order: 0, type: "likert", prompt: { en: "I feel supported at work" } }],
    });
    expect(res.status).toBe(201);
  });
});

describe("route ordering: /surveys/available must not be swallowed by /surveys/:id", () => {
  it("hits the employee listing controller, not the hr get-by-id controller", async () => {
    surveyService.listForEmployee.mockResolvedValue([]);
    const res = await request(app).get("/api/surveys/available").set(employeeAuth);
    expect(res.status).toBe(200);
    expect(surveyService.listForEmployee).toHaveBeenCalled();
    expect(surveyService.get).not.toHaveBeenCalled();
  });
});

describe("employee endpoints", () => {
  it("passes the gateway-forwarded department header through to the service", async () => {
    surveyService.getForEmployee.mockResolvedValue({ _id: "s1" });
    await request(app).get("/api/surveys/available/s1").set(employeeAuth).set("X-Department-Id", "dept-9");
    expect(surveyService.getForEmployee).toHaveBeenCalledWith("org1", "s1", "dept-9");
  });

  it("403 from the service (wrong department) propagates as 403 over HTTP", async () => {
    const { forbidden } = require("@sentilens/shared");
    surveyService.getForEmployee.mockRejectedValue(forbidden("this survey is not available to your department"));
    const res = await request(app).get("/api/surveys/available/s1").set(employeeAuth);
    expect(res.status).toBe(403);
  });
});
