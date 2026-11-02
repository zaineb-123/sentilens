jest.mock("../src/services/notificationService");
const request = require("supertest");
const notificationService = require("../src/services/notificationService");
const { createApp } = require("../src/app");
const { tokenFor } = require("./helpers");

const app = createApp();
const auth = { Authorization: `Bearer ${tokenFor({ id: "u1", role: "hr" })}` };

beforeEach(() => jest.clearAllMocks());

it("requires authentication", async () => {
  expect((await request(app).get("/api/notifications")).status).toBe(401);
});

it("lists notifications for the authenticated user", async () => {
  notificationService.listForUser.mockResolvedValue([{ title: "Workload trend" }]);
  const res = await request(app).get("/api/notifications").set(auth);
  expect(res.status).toBe(200);
  expect(notificationService.listForUser).toHaveBeenCalledWith("org1", "u1", { unreadOnly: false });
});

it("passes ?unread=true through as unreadOnly", async () => {
  notificationService.listForUser.mockResolvedValue([]);
  await request(app).get("/api/notifications?unread=true").set(auth);
  expect(notificationService.listForUser).toHaveBeenCalledWith("org1", "u1", { unreadOnly: true });
});

it("marks a notification read, scoped to the caller", async () => {
  notificationService.markRead.mockResolvedValue({ _id: "n1", read: true });
  const res = await request(app).patch("/api/notifications/n1/read").set(auth);
  expect(res.status).toBe(200);
  expect(notificationService.markRead).toHaveBeenCalledWith("org1", "u1", "n1");
});

it("404s marking read a notification that isn't the caller's", async () => {
  notificationService.markRead.mockResolvedValue(null);
  const res = await request(app).patch("/api/notifications/not-mine/read").set(auth);
  expect(res.status).toBe(404);
});

it("returns the unread count", async () => {
  notificationService.unreadCount.mockResolvedValue(7);
  const res = await request(app).get("/api/notifications/unread-count").set(auth);
  expect(res.body.count).toBe(7);
});
