jest.mock("../src/models/EmployeeProfile");
const request = require("supertest");
const EmployeeProfile = require("../src/models/EmployeeProfile");
const { createApp } = require("../src/app");
const { tokenFor } = require("./helpers");

const app = createApp();
const auth = { Authorization: `Bearer ${tokenFor({ id: "emp1", role: "employee" })}` };

beforeEach(() => jest.clearAllMocks());

it("an employee can only ever fetch their own profile (scoped by JWT userId, not client input)", async () => {
  EmployeeProfile.findOne.mockResolvedValue({ userId: "emp1", locale: "fr" });
  const res = await request(app).get("/api/me/profile").set(auth);
  expect(res.status).toBe(200);
  expect(EmployeeProfile.findOne).toHaveBeenCalledWith({ userId: "emp1" });
});

it("404s when no profile exists yet", async () => {
  EmployeeProfile.findOne.mockResolvedValue(null);
  expect((await request(app).get("/api/me/profile").set(auth)).status).toBe(404);
});

it("updating rejects unknown fields (e.g. cannot set orgId from the client)", async () => {
  const res = await request(app).patch("/api/me/profile").set(auth).send({ orgId: "other-org", locale: "en" });
  expect(res.status).toBe(422);
});

it("updating locale succeeds and is scoped to the caller", async () => {
  EmployeeProfile.findOneAndUpdate.mockResolvedValue({ userId: "emp1", locale: "en" });
  const res = await request(app).patch("/api/me/profile").set(auth).send({ locale: "en" });
  expect(res.status).toBe(200);
  expect(EmployeeProfile.findOneAndUpdate).toHaveBeenCalledWith({ userId: "emp1" }, { $set: { locale: "en" } }, { new: true });
});
