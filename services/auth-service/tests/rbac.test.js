const express = require("express");
const request = require("supertest");
const { requireAuth, requireRole, trustGatewayHeaders } = require("@sentilens/shared");
const { signAccessToken } = require("../src/services/tokenService");

function appWithGuard(...mw) {
  const app = express();
  app.use(...mw);
  app.get("/protected", (req, res) => res.json({ ok: true, user: req.user }));
  app.use((err, req, res, next) => res.status(err.status || 500).json({ error: { code: err.code } }));
  return app;
}

describe("requireAuth + requireRole (direct JWT verification)", () => {
  const app = appWithGuard(requireAuth("test-access-secret"));

  it("rejects missing token", async () => {
    expect((await request(app).get("/protected")).status).toBe(401);
  });

  it("rejects a garbage token", async () => {
    const res = await request(app).get("/protected").set("Authorization", "Bearer garbage");
    expect(res.status).toBe(401);
  });

  it("accepts a valid token and exposes req.user", async () => {
    const token = signAccessToken({ _id: "u1", orgId: "o1", role: "hr" });
    const res = await request(app).get("/protected").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ id: "u1", orgId: "o1", role: "hr" });
  });
});

describe("requireRole denies the wrong role", () => {
  const app = appWithGuard(requireAuth("test-access-secret"), requireRole("admin"));

  it("403s an hr token on an admin-only route", async () => {
    const token = signAccessToken({ _id: "u1", orgId: "o1", role: "hr" });
    const res = await request(app).get("/protected").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  it("200s an admin token", async () => {
    const token = signAccessToken({ _id: "u1", orgId: "o1", role: "admin" });
    const res = await request(app).get("/protected").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});

describe("trustGatewayHeaders (used by downstream services behind the gateway)", () => {
  const app = appWithGuard(trustGatewayHeaders("internal-key"));

  it("rejects a missing/incorrect internal key even with user headers present", async () => {
    const res = await request(app).get("/protected").set("X-User-Id", "u1").set("X-User-Role", "hr");
    expect(res.status).toBe(401);
  });

  it("accepts a correct internal key and maps headers to req.user", async () => {
    const res = await request(app).get("/protected")
      .set("X-Internal-Key", "internal-key").set("X-User-Id", "u1").set("X-User-Role", "hr").set("X-Org-Id", "o1");
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ id: "u1", role: "hr", orgId: "o1" });
  });
});
