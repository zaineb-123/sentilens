jest.mock("../src/services/statsService");
jest.mock("../src/services/alertsService");
const request = require("supertest");
const statsService = require("../src/services/statsService");
const alertsService = require("../src/services/alertsService");
const { createApp } = require("../src/app");
const { tokenFor } = require("./helpers");

const app = createApp();
const hrAuth = { Authorization: `Bearer ${tokenFor({ role: "hr" })}` };
const employeeAuth = { Authorization: `Bearer ${tokenFor({ role: "employee" })}` };

beforeEach(() => jest.clearAllMocks());

describe("RBAC: analytics and alerts are hr-only", () => {
  it.each(["overview", "sentiment", "emotions", "aspects", "trends"])("employee cannot GET /analytics/%s", async (path) => {
    const res = await request(app).get(`/api/analytics/${path}`).set(employeeAuth);
    expect(res.status).toBe(403);
  });

  it("unauthenticated requests are rejected", async () => {
    expect((await request(app).get("/api/analytics/overview")).status).toBe(401);
  });

  it("employee cannot list alerts", async () => {
    expect((await request(app).get("/api/alerts").set(employeeAuth)).status).toBe(403);
  });
});

describe("overview passes filters through and returns whatever the service decides", () => {
  it("returns real (service-computed) numbers, not anything hardcoded here", async () => {
    statsService.overview.mockResolvedValue({ privacy: { suppressed: false }, totalFeedback: 248, sentiment: { positive: 61, neutral: 22, negative: 12, mixed: 5 }, topAspects: [] });
    const res = await request(app).get("/api/analytics/overview").set(hrAuth);
    expect(res.status).toBe(200);
    expect(res.body.totalFeedback).toBe(248);
  });

  it("surfaces a suppression response with HTTP 200 (not an error)", async () => {
    statsService.overview.mockResolvedValue({ privacy: { suppressed: true, reason: "Not enough responses to protect anonymity.", minGroupSize: 5, count: 4 } });
    const res = await request(app).get("/api/analytics/overview").set(hrAuth).query({ departmentId: "d1" });
    expect(res.status).toBe(200);
    expect(res.body.privacy.suppressed).toBe(true);
  });
});

describe("department comparison requires departmentIds", () => {
  it("rejects the request when departmentIds is missing", async () => {
    const res = await request(app).get("/api/analytics/departments").set(hrAuth);
    expect(res.status).toBe(422);
  });

  it("splits the comma-separated list and forwards it to the service", async () => {
    statsService.departmentComparison.mockResolvedValue({ minGroupSize: 5, departments: [] });
    await request(app).get("/api/analytics/departments").set(hrAuth).query({ departmentIds: "d1,d2, d3" });
    expect(statsService.departmentComparison).toHaveBeenCalledWith("org1", expect.anything(), ["d1", "d2", "d3"]);
  });
});

describe("alerts", () => {
  it("lists alerts for the caller's org", async () => {
    alertsService.list.mockResolvedValue([{ aspectKey: "workload", changePct: 18.2 }]);
    const res = await request(app).get("/api/alerts").set(hrAuth);
    expect(res.status).toBe(200);
    expect(res.body.alerts).toHaveLength(1);
  });

  it("acknowledges an alert", async () => {
    alertsService.acknowledge.mockResolvedValue({ _id: "a1", status: "acknowledged" });
    const res = await request(app).patch("/api/alerts/a1").set(hrAuth);
    expect(res.status).toBe(200);
    expect(res.body.alert.status).toBe("acknowledged");
  });

  it("404s when acknowledging an alert that does not exist (or belongs to another org)", async () => {
    alertsService.acknowledge.mockResolvedValue(null);
    const res = await request(app).patch("/api/alerts/nope").set(hrAuth);
    expect(res.status).toBe(404);
  });
});

describe("CSV export", () => {
  it("employee cannot export", async () => {
    const res = await request(app).get("/api/analytics/export").set(employeeAuth);
    expect(res.status).toBe(403);
  });
  it("returns a CSV file with the right headers when data is not suppressed", async () => {
    statsService.overview.mockResolvedValue({ privacy: { suppressed: false }, totalFeedback: 10, sentiment: { positive: 50, neutral: 30, negative: 10, mixed: 10 } });
    statsService.aspectBreakdown.mockResolvedValue({ privacy: { suppressed: false }, aspects: [] });
    const res = await request(app).get("/api/analytics/export").set(hrAuth);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/csv/);
    expect(res.headers["content-disposition"]).toMatch(/attachment/);
    expect(res.text).toContain("total_feedback,10");
  });
  it("returns the privacy suppression JSON instead of a CSV when the group is too small", async () => {
    statsService.overview.mockResolvedValue({ privacy: { suppressed: true, reason: "Not enough responses to protect anonymity.", minGroupSize: 5, count: 3 } });
    const res = await request(app).get("/api/analytics/export").set(hrAuth).query({ departmentId: "d1" });
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(res.body.privacy.suppressed).toBe(true);
    expect(statsService.aspectBreakdown).not.toHaveBeenCalled();
  });
});
