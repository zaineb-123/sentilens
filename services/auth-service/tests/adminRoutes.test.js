jest.mock("../src/models/User");
jest.mock("../src/models/Invitation");
const request = require("supertest");
const User = require("../src/models/User");
const Invitation = require("../src/models/Invitation");
const { createApp } = require("../src/app");
const jwt = require("jsonwebtoken");

function tokenFor({ id = "u1", orgId = "org1", role = "admin" }) {
  return jwt.sign({ sub: id, orgId, role }, "test-access-secret", { expiresIn: "15m", issuer: "sentilens-auth" });
}
const app = createApp();
const adminAuth = { Authorization: `Bearer ${tokenFor({})}` };
const hrAuth = { Authorization: `Bearer ${tokenFor({ role: "hr" })}` };

beforeEach(() => jest.clearAllMocks());

describe("RBAC", () => {
  it("hr cannot list users", async () => {
    expect((await request(app).get("/api/auth/users").set(hrAuth)).status).toBe(403);
  });
  it("hr cannot invite a user", async () => {
    expect((await request(app).post("/api/auth/users/invite").set(hrAuth).send({ email: "a@b.com", role: "employee" })).status).toBe(403);
  });
  it("unauthenticated requests are rejected", async () => {
    expect((await request(app).get("/api/auth/users")).status).toBe(401);
  });
});

describe("listUsers", () => {
  it("scopes the list to the admin's own org", async () => {
    User.find.mockReturnValue({ sort: () => Promise.resolve([]) });
    await request(app).get("/api/auth/users").set(adminAuth);
    expect(User.find).toHaveBeenCalledWith({ orgId: "org1" });
  });
  it("applies optional role/status filters", async () => {
    User.find.mockReturnValue({ sort: () => Promise.resolve([]) });
    await request(app).get("/api/auth/users?role=hr&status=active").set(adminAuth);
    expect(User.find).toHaveBeenCalledWith({ orgId: "org1", role: "hr", status: "active" });
  });
});

describe("inviteUser", () => {
  it("rejects inviting an email that already has an account in this org", async () => {
    User.findOne.mockResolvedValue({ _id: "existing" });
    const res = await request(app).post("/api/auth/users/invite").set(adminAuth).send({ email: "a@b.com", role: "hr" });
    expect(res.status).toBe(400);
    expect(Invitation.create).not.toHaveBeenCalled();
  });
  it("creates an invitation scoped to the admin's org and returns the one-time code", async () => {
    User.findOne.mockResolvedValue(null);
    Invitation.create.mockResolvedValue({ _id: "inv1" });
    const res = await request(app).post("/api/auth/users/invite").set(adminAuth).send({ email: "new@acme.com", role: "hr" });
    expect(res.status).toBe(201);
    expect(Invitation.create).toHaveBeenCalledWith(expect.objectContaining({ email: "new@acme.com", orgId: "org1", role: "hr" }));
    expect(res.body.invitationCode).toMatch(/^[0-9a-f]{32}$/);
  });
  it("rejects an invalid role", async () => {
    const res = await request(app).post("/api/auth/users/invite").set(adminAuth).send({ email: "a@b.com", role: "superadmin" });
    expect(res.status).toBe(422);
  });
});

describe("updateUserStatus", () => {
  it("disables a user, scoped to the admin's org", async () => {
    User.findOneAndUpdate.mockResolvedValue({ _id: "u2", status: "disabled" });
    const res = await request(app).patch("/api/auth/users/u2/status").set(adminAuth).send({ status: "disabled" });
    expect(res.status).toBe(200);
    expect(User.findOneAndUpdate).toHaveBeenCalledWith({ _id: "u2", orgId: "org1" }, { status: "disabled" }, { new: true });
  });
  it("404s for a user outside the admin's org", async () => {
    User.findOneAndUpdate.mockResolvedValue(null);
    const res = await request(app).patch("/api/auth/users/u2/status").set(adminAuth).send({ status: "disabled" });
    expect(res.status).toBe(404);
  });
});
