jest.mock("../src/services/authService");
const request = require("supertest");
const authService = require("../src/services/authService");
const { createApp } = require("../src/app");

const app = createApp();

describe("input validation (no service call reaches the mock on bad input)", () => {
  it("rejects a short password on register", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "a@b.com", password: "short", invitationCode: "abcdef" });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(authService.register).not.toHaveBeenCalled();
  });

  it("rejects an invalid email on login", async () => {
    const res = await request(app).post("/api/auth/login").send({ email: "not-an-email", password: "whatever123" });
    expect(res.status).toBe(422);
  });

  it("rejects register with no invitation code", async () => {
    const res = await request(app).post("/api/auth/register").send({ email: "a@b.com", password: "longenoughpassword" });
    expect(res.status).toBe(422);
  });
});

describe("happy paths set the refresh cookie and never leak the raw token in JSON", () => {
  it("login", async () => {
    authService.login.mockResolvedValue({ user: { email: "a@b.com" }, accessToken: "at", refreshToken: "rt", refreshExpiresAt: new Date(Date.now() + 1000) });
    const res = await request(app).post("/api/auth/login").send({ email: "a@b.com", password: "correct-password" });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBe("at");
    expect(res.body.refreshToken).toBeUndefined();
    expect(res.headers["set-cookie"][0]).toMatch(/sentilens_refresh=rt/);
    expect(res.headers["set-cookie"][0]).toMatch(/HttpOnly/);
  });

  it("register", async () => {
    authService.register.mockResolvedValue({ user: { email: "a@b.com" }, accessToken: "at", refreshToken: "rt", refreshExpiresAt: new Date(Date.now() + 1000) });
    const res = await request(app).post("/api/auth/register").send({ email: "a@b.com", password: "longenoughpassword", invitationCode: "abcdef" });
    expect(res.status).toBe(201);
  });
});

describe("error propagation", () => {
  it("maps a service ApiError to the right HTTP status", async () => {
    const { unauthorized } = require("@sentilens/shared");
    authService.login.mockRejectedValue(unauthorized("invalid email or password"));
    const res = await request(app).post("/api/auth/login").send({ email: "a@b.com", password: "wrongpassword" });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });
});

describe("refresh / logout", () => {
  it("rejects refresh with no token anywhere", async () => {
    const res = await request(app).post("/api/auth/refresh").send({});
    expect(res.status).toBe(400);
  });

  it("accepts a refresh token via cookie (not only body)", async () => {
    authService.refresh.mockResolvedValue({ user: { email: "a@b.com" }, accessToken: "at2", refreshToken: "rt2", refreshExpiresAt: new Date(Date.now() + 1000) });
    const res = await request(app).post("/api/auth/refresh").set("Cookie", "sentilens_refresh=rt-old").send({});
    expect(res.status).toBe(200);
    expect(authService.refresh).toHaveBeenCalledWith("rt-old");
  });

  it("logout clears the cookie and returns 204 even with no token", async () => {
    const res = await request(app).post("/api/auth/logout");
    expect(res.status).toBe(204);
  });
});

describe("/me requires a valid bearer token", () => {
  it("401s with no token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });
});

describe("system endpoints", () => {
  it("health is public", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
  });
  it("serves an OpenAPI document", async () => {
    const res = await request(app).get("/openapi.json");
    expect(res.status).toBe(200);
    expect(res.body.info.title).toMatch(/Auth Service/);
  });
  it("404s on unknown routes with the shared error envelope", async () => {
    const res = await request(app).get("/api/auth/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
