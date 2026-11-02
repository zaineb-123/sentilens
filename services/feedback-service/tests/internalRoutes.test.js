jest.mock("../src/models/Feedback");
const request = require("supertest");
const Feedback = require("../src/models/Feedback");
const { createApp } = require("../src/app");

const app = createApp();
beforeEach(() => jest.clearAllMocks());

it("rejects internal calls without the internal key", async () => {
  expect((await request(app).get("/internal/feedback/pending")).status).toBe(401);
});

it("claims pending feedback one at a time until none remain, atomically flipping status to processing", async () => {
  const docs = [{ _id: "f1" }, { _id: "f2" }];
  let call = 0;
  Feedback.findOneAndUpdate.mockReturnValue({
    select: () => Promise.resolve(call < docs.length ? docs[call++] : null),
  });
  const res = await request(app).get("/internal/feedback/pending?limit=5").set("X-Internal-Key", "test-internal-key");
  expect(res.status).toBe(200);
  expect(res.body.count).toBe(2);
  expect(Feedback.findOneAndUpdate).toHaveBeenCalledWith(
    expect.objectContaining({ $or: expect.any(Array) }),
    { analysisStatus: "processing", lockedAt: expect.any(Date) },
    expect.objectContaining({ new: true }),
  );
});

it("also reclaims stale-locked (processing but abandoned) feedback, not only pending", async () => {
  Feedback.findOneAndUpdate.mockReturnValue({ select: () => Promise.resolve(null) });
  await request(app).get("/internal/feedback/pending").set("X-Internal-Key", "test-internal-key");
  const filter = Feedback.findOneAndUpdate.mock.calls[0][0];
  expect(filter.$or).toEqual(expect.arrayContaining([
    { analysisStatus: "pending" },
    expect.objectContaining({ analysisStatus: "processing" }),
  ]));
});

it("updates analysis status and releases the lock", async () => {
  Feedback.findByIdAndUpdate.mockResolvedValue({ _id: "f1", analysisStatus: "done" });
  const res = await request(app).patch("/internal/feedback/f1/analysis-status")
    .set("X-Internal-Key", "test-internal-key").send({ status: "done" });
  expect(res.status).toBe(200);
  expect(Feedback.findByIdAndUpdate).toHaveBeenCalledWith("f1", { analysisStatus: "done", lockedAt: null }, { new: true });
});

it("rejects an invalid status value", async () => {
  const res = await request(app).patch("/internal/feedback/f1/analysis-status")
    .set("X-Internal-Key", "test-internal-key").send({ status: "bogus" });
  expect(res.status).toBe(400);
});
