jest.mock("../src/models/EmployeeProfile");
const request = require("supertest");
const EmployeeProfile = require("../src/models/EmployeeProfile");
const { createApp } = require("../src/app");

const app = createApp();
beforeEach(() => jest.clearAllMocks());

it("returns the profile (incl. departmentId) for a given userId, internal-only", async () => {
  EmployeeProfile.findOne.mockReturnValue({ select: () => ({ lean: () => Promise.resolve({ userId: "u1", orgId: "org1", departmentId: "d1" }) }) });
  const res = await request(app).get("/internal/employee-profiles/u1").set("X-Internal-Key", "test-internal-key");
  expect(res.status).toBe(200);
  expect(res.body.profile.departmentId).toBe("d1");
});

it("returns null (not 404) when the employee has no profile yet", async () => {
  EmployeeProfile.findOne.mockReturnValue({ select: () => ({ lean: () => Promise.resolve(null) }) });
  const res = await request(app).get("/internal/employee-profiles/u1").set("X-Internal-Key", "test-internal-key");
  expect(res.status).toBe(200);
  expect(res.body.profile).toBeNull();
});

it("rejects without the internal key", async () => {
  expect((await request(app).get("/internal/employee-profiles/u1")).status).toBe(401);
});
