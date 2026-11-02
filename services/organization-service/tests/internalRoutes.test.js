jest.mock("../src/models/EmployeeProfile");
jest.mock("../src/models/Department");
const request = require("supertest");
const EmployeeProfile = require("../src/models/EmployeeProfile");
const { createApp } = require("../src/app");

const app = createApp();

it("rejects internal calls without the internal key", async () => {
  const res = await request(app).post("/internal/employee-profiles").send({ userId: "u1", orgId: "org1" });
  expect(res.status).toBe(401);
});

it("accepts a correctly-authenticated internal call and upserts the profile", async () => {
  EmployeeProfile.findOneAndUpdate.mockResolvedValue({ userId: "u1", orgId: "org1" });
  const res = await request(app).post("/internal/employee-profiles")
    .set("X-Internal-Key", "test-internal-key").send({ userId: "u1", orgId: "org1" });
  expect(res.status).toBe(201);
});

const Department = require("../src/models/Department");

it("resolves department names to ids for CSV import (internal-only)", async () => {
  Department.find.mockReturnValue({ select: () => Promise.resolve([{ _id: "d1", name: "Engineering" }, { _id: "d2", name: "Sales" }]) });
  const res = await request(app).get("/internal/departments/resolve?orgId=org1&names=Engineering,Sales,Unknown")
    .set("X-Internal-Key", "test-internal-key");
  expect(res.status).toBe(200);
  expect(res.body.map).toEqual({ Engineering: "d1", Sales: "d2" });
});
