jest.mock("../src/models/Organization");
jest.mock("../src/models/Department");
jest.mock("../src/models/AuditLog");
const request = require("supertest");
const Organization = require("../src/models/Organization");
const Department = require("../src/models/Department");
const AuditLog = require("../src/models/AuditLog");
const { createApp } = require("../src/app");
const { tokenFor } = require("./helpers");

const app = createApp();
const adminAuth = { Authorization: `Bearer ${tokenFor({ role: "admin" })}` };
const hrAuth = { Authorization: `Bearer ${tokenFor({ role: "hr" })}` };
const employeeAuth = { Authorization: `Bearer ${tokenFor({ role: "employee" })}` };

beforeEach(() => jest.clearAllMocks());

describe("RBAC on organization/department routes", () => {
  it("rejects an unauthenticated request", async () => {
    expect((await request(app).get("/api/departments")).status).toBe(401);
  });

  it("employee cannot create a department", async () => {
    const res = await request(app).post("/api/departments").set(employeeAuth).send({ name: "Marketing" });
    expect(res.status).toBe(403);
  });

  it("hr can list departments but cannot create one", async () => {
    Department.find.mockReturnValue({ sort: () => Promise.resolve([]) });
    expect((await request(app).get("/api/departments").set(hrAuth)).status).toBe(200);
    expect((await request(app).post("/api/departments").set(hrAuth).send({ name: "X" })).status).toBe(403);
  });

  it("admin can create a department, and it is scoped to their orgId from the JWT", async () => {
    Department.findOne.mockResolvedValue(null);
    Department.create.mockResolvedValue({ _id: "d1", name: "Engineering" });
    AuditLog.create.mockResolvedValue({});
    const res = await request(app).post("/api/departments").set(adminAuth).send({ name: "Engineering" });
    expect(res.status).toBe(201);
    expect(Department.create).toHaveBeenCalledWith(expect.objectContaining({ orgId: "org1", name: "Engineering" }));
  });

  it("rejects a duplicate department name within the same org", async () => {
    Department.findOne.mockResolvedValue({ _id: "existing" });
    const res = await request(app).post("/api/departments").set(adminAuth).send({ name: "Engineering" });
    expect(res.status).toBe(409);
  });
});

describe("validation", () => {
  it("rejects an org slug with invalid characters", async () => {
    const res = await request(app).post("/api/organizations").set(adminAuth).send({ name: "Acme", slug: "Not A Slug!" });
    expect(res.status).toBe(422);
  });

  it("rejects a min group size below the floor", async () => {
    const res = await request(app).put("/api/organizations/org1/settings").set(adminAuth).send({ minGroupSize: 1 });
    expect(res.status).toBe(422);
  });
});

describe("audit logging happens on writes and never blocks the response", () => {
  it("still returns 201 even if the audit write throws", async () => {
    Department.findOne.mockResolvedValue(null);
    Department.create.mockResolvedValue({ _id: "d2", name: "Sales" });
    AuditLog.create.mockRejectedValue(new Error("db down"));
    const res = await request(app).post("/api/departments").set(adminAuth).send({ name: "Sales" });
    expect(res.status).toBe(201);
  });
});
