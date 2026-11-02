jest.mock("../src/services/orgClient");
const request = require("supertest");
const orgClient = require("../src/services/orgClient");
const { createApp } = require("../src/app");
const { tokenFor } = require("./helpers");

const app = createApp();
const employeeAuth = { Authorization: `Bearer ${tokenFor({ id: "u1", role: "employee" })}` };
const hrAuth = { Authorization: `Bearer ${tokenFor({ id: "hr1", role: "hr" })}` };
const adminAuth = { Authorization: `Bearer ${tokenFor({ id: "admin1", role: "admin" })}` };

function fakeJsonResponse(status, body, headers = {}) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });
}

beforeEach(() => {
  jest.clearAllMocks();
  global.fetch = jest.fn();
  orgClient.getEmployeeDepartmentId.mockResolvedValue(null);
});

describe("auth passthrough: no gateway-level auth gate", () => {
  it("proxies an unauthenticated login request straight to auth-service", async () => {
    global.fetch.mockResolvedValue(fakeJsonResponse(200, { user: { email: "a@b.com" }, accessToken: "at" }));
    const res = await request(app).post("/api/auth/login").send({ email: "a@b.com", password: "whatever123" });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBe("at");
    expect(global.fetch).toHaveBeenCalledWith("http://auth-service.test:4001/api/auth/login", expect.any(Object));
  });

  it("forwards the Set-Cookie header from auth-service back to the client", async () => {
    global.fetch.mockResolvedValue(fakeJsonResponse(200, { user: {} }, { "set-cookie": "sentilens_refresh=abc; HttpOnly" }));
    const res = await request(app).post("/api/auth/login").send({ email: "a@b.com", password: "whatever123" });
    expect(res.headers["set-cookie"][0]).toMatch(/sentilens_refresh=abc/);
  });
});

describe("every other prefix requires a valid JWT at the gateway", () => {
  it.each([
    ["GET", "/api/organizations"], ["GET", "/api/departments"], ["GET", "/api/audit-logs"],
    ["GET", "/api/surveys"], ["GET", "/api/surveys/available"], ["GET", "/api/me/participations"],
    ["POST", "/api/feedback"], ["GET", "/api/analytics/overview"], ["GET", "/api/alerts"], ["GET", "/api/notifications"],
  ])("%s %s is rejected with no token, without ever reaching a backend", async (method, path) => {
    const res = await request(app)[method.toLowerCase()](path);
    expect(res.status).toBe(401);
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe("routing table sends each prefix to the correct service", () => {
  const cases = [
    ["GET", "/api/organizations", "http://organization-service.test:4002/api/organizations", hrAuth],
    ["GET", "/api/departments", "http://organization-service.test:4002/api/departments", hrAuth],
    ["GET", "/api/surveys", "http://survey-service.test:4003/api/surveys", hrAuth],
    ["GET", "/api/me/participations", "http://survey-service.test:4003/api/me/participations", employeeAuth],
    ["GET", "/api/analytics/overview", "http://analytics-service.test:4006/api/analytics/overview", hrAuth],
    ["GET", "/api/alerts", "http://analytics-service.test:4006/api/alerts", hrAuth],
    ["GET", "/api/notifications", "http://notification-service.test:4007/api/notifications", hrAuth],
  ];
  it.each(cases)("%s %s -> %s", async (method, path, expectedUrl, auth) => {
    global.fetch.mockResolvedValue(fakeJsonResponse(200, { ok: true }));
    await request(app)[method.toLowerCase()](path).set(auth);
    expect(global.fetch).toHaveBeenCalledWith(expectedUrl, expect.any(Object));
  });

  it("the more specific /api/surveys/available is not swallowed by the general /api/surveys mount", async () => {
    global.fetch.mockResolvedValue(fakeJsonResponse(200, { surveys: [] }));
    await request(app).get("/api/surveys/available").set(employeeAuth);
    expect(global.fetch).toHaveBeenCalledWith("http://survey-service.test:4003/api/surveys/available", expect.any(Object));
  });
});

describe("anonymous-feedback orchestration: department header injection", () => {
  it("resolves and injects X-Department-Id for an employee submitting feedback", async () => {
    orgClient.getEmployeeDepartmentId.mockResolvedValue("dept-9");
    global.fetch.mockResolvedValue(fakeJsonResponse(201, { receiptCode: "ABCDEF123456" }));
    await request(app).post("/api/feedback").set(employeeAuth).send({ comment: "fine" });
    const [, init] = global.fetch.mock.calls[0];
    expect(init.headers["x-department-id"]).toBe("dept-9");
  });

  it("does not attempt department resolution for hr requests", async () => {
    global.fetch.mockResolvedValue(fakeJsonResponse(200, { items: [] }));
    await request(app).get("/api/feedback").set(hrAuth);
    expect(orgClient.getEmployeeDepartmentId).not.toHaveBeenCalled();
  });

  it("degrades gracefully (no header, request still proceeds) if department lookup fails", async () => {
    orgClient.getEmployeeDepartmentId.mockRejectedValue(new Error("organization-service down"));
    global.fetch.mockResolvedValue(fakeJsonResponse(201, { receiptCode: "X" }));
    const res = await request(app).post("/api/feedback").set(employeeAuth).send({ comment: "fine" });
    expect(res.status).toBe(201);
    const [, init] = global.fetch.mock.calls[0];
    expect(init.headers["x-department-id"]).toBeUndefined();
  });

  it("injects the department header for GET /api/surveys/available too", async () => {
    orgClient.getEmployeeDepartmentId.mockResolvedValue("dept-9");
    global.fetch.mockResolvedValue(fakeJsonResponse(200, { surveys: [] }));
    await request(app).get("/api/surveys/available").set(employeeAuth);
    const [, init] = global.fetch.mock.calls[0];
    expect(init.headers["x-department-id"]).toBe("dept-9");
  });
});

describe("resilience", () => {
  it("returns 503 (not a crash) when the target service is unreachable", async () => {
    global.fetch.mockRejectedValue(new Error("ECONNREFUSED"));
    const res = await request(app).get("/api/surveys").set(hrAuth);
    expect(res.status).toBe(503);
    expect(res.body.error.code).toBe("UPSTREAM_UNAVAILABLE");
  });

  it("relays a non-2xx status and error body from a backend unchanged", async () => {
    global.fetch.mockResolvedValue(fakeJsonResponse(409, { error: { code: "ALREADY_PARTICIPATED", message: "already answered" } }));
    const res = await request(app).post("/api/feedback").set(employeeAuth).send({ surveyId: "s1" });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("ALREADY_PARTICIPATED");
  });
});

describe("system endpoints", () => {
  it("health is public and does not proxy anywhere", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("serves the merged OpenAPI document covering every public service", async () => {
    const res = await request(app).get("/api/openapi.json");
    expect(res.status).toBe(200);
    expect(res.body.paths).toHaveProperty("/api/auth/login");
    expect(res.body.paths).toHaveProperty("/api/surveys");
    expect(res.body.paths).toHaveProperty("/api/feedback");
    expect(res.body.paths).toHaveProperty("/api/analytics/overview");
    expect(res.body.paths).toHaveProperty("/api/notifications");
  });

  it("every response carries a correlation id, generating one if the client didn't send one", async () => {
    const res = await request(app).get("/health");
    expect(res.headers["x-correlation-id"]).toBeTruthy();
  });

  it("echoes back a client-supplied correlation id instead of replacing it", async () => {
    const res = await request(app).get("/health").set("X-Correlation-Id", "client-cid-123");
    expect(res.headers["x-correlation-id"]).toBe("client-cid-123");
  });
});

describe("system health aggregation (admin monitoring)", () => {
  it("requires admin role, not just any authenticated user", async () => {
    const res = await request(app).get("/api/system/health").set(hrAuth);
    expect(res.status).toBe(403);
  });

  it("reports overall up when every service responds 200", async () => {
    global.fetch.mockResolvedValue(new Response(JSON.stringify({ status: "ok" }), { status: 200 }));
    const res = await request(app).get("/api/system/health").set(adminAuth);
    expect(res.status).toBe(200);
    expect(res.body.overall).toBe("up");
    expect(res.body.services).toHaveProperty("auth");
    expect(res.body.services).toHaveProperty("ai");
  });

  it("reports degraded (not a crash) when one service is unreachable", async () => {
    global.fetch.mockImplementation((url) =>
      url.includes("feedback-service")
        ? Promise.reject(new Error("ECONNREFUSED"))
        : Promise.resolve(new Response(JSON.stringify({ status: "ok" }), { status: 200 })),
    );
    const res = await request(app).get("/api/system/health").set(adminAuth);
    expect(res.status).toBe(200);
    expect(res.body.overall).toBe("degraded");
    expect(res.body.services.feedback.status).toBe("down");
    expect(res.body.services.auth.status).toBe("up");
  });
});
