jest.mock("../src/services/notificationService");
const request = require("supertest");
const notificationService = require("../src/services/notificationService");
const { createApp } = require("../src/app");

const app = createApp();
beforeEach(() => jest.clearAllMocks());

it("rejects internal calls without the internal key", async () => {
  expect((await request(app).post("/internal/notifications").send({})).status).toBe(401);
});

it("rejects a request missing required fields", async () => {
  const res = await request(app).post("/internal/notifications").set("X-Internal-Key", "test-internal-key").send({ orgId: "org1" });
  expect(res.status).toBe(400);
});

it("creates a notification on behalf of another service (e.g. Analytics)", async () => {
  notificationService.create.mockResolvedValue({ _id: "n1", title: "Workload trend" });
  const res = await request(app).post("/internal/notifications").set("X-Internal-Key", "test-internal-key")
    .send({ orgId: "org1", recipientUserId: "u1", type: "alert", title: "Workload trend" });
  expect(res.status).toBe(201);
  expect(res.body.notification.title).toBe("Workload trend");
});
