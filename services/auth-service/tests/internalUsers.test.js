jest.mock("../src/models/User");
const request = require("supertest");
const User = require("../src/models/User");
const { createApp } = require("../src/app");

const app = createApp();
beforeEach(() => jest.clearAllMocks());

it("rejects internal calls without the internal key", async () => {
  expect((await request(app).get("/internal/users?orgId=org1&role=hr")).status).toBe(401);
});

it("lists user ids filtered by org and role (used to resolve alert recipients)", async () => {
  User.find.mockReturnValue({ select: () => ({ lean: () => Promise.resolve([{ _id: "u1" }, { _id: "u2" }]) }) });
  const res = await request(app).get("/internal/users?orgId=org1&role=hr").set("X-Internal-Key", "test-internal-key");
  expect(res.status).toBe(200);
  expect(res.body.userIds).toEqual(["u1", "u2"]);
  expect(User.find).toHaveBeenCalledWith({ orgId: "org1", role: "hr" });
});
