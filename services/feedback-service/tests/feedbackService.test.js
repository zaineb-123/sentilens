jest.mock("../src/models/Feedback");
jest.mock("../src/services/surveyClient");
jest.mock("../src/services/analysisClient");
const Feedback = require("../src/models/Feedback");
const surveyClient = require("../src/services/surveyClient");
const analysisClient = require("../src/services/analysisClient");
const feedbackService = require("../src/services/feedbackService");

beforeEach(() => {
  jest.clearAllMocks();
  analysisClient.enqueue.mockResolvedValue(undefined);
});

describe("submit (privacy-critical)", () => {
  it("never includes userId, ip, or user-agent in the created Feedback document", async () => {
    Feedback.create.mockResolvedValue({ _id: "f1", orgId: "org1", departmentId: "d1", surveyId: null, comment: "", day: new Date() });
    await feedbackService.submit({ orgId: "org1", userId: "u1", departmentId: "d1", comment: "The team is great." });

    const createArg = Feedback.create.mock.calls[0][0];
    expect(createArg).not.toHaveProperty("userId");
    expect(createArg).not.toHaveProperty("ip");
    expect(createArg).not.toHaveProperty("userAgent");
    expect(Object.keys(createArg)).toEqual(
      expect.arrayContaining(["orgId", "departmentId", "surveyId", "source", "answers", "comment", "receiptHash", "day"]),
    );
  });

  it("masks PII in the comment before storing it", async () => {
    Feedback.create.mockResolvedValue({ _id: "f1", orgId: "org1", day: new Date() });
    await feedbackService.submit({ orgId: "org1", userId: "u1", comment: "reach me at a@b.com" });
    expect(Feedback.create.mock.calls[0][0].comment).toBe("reach me at [email]");
  });

  it("passes userId to the Survey Service for participation, but that is the only place it goes", async () => {
    surveyClient.checkAndRecordParticipation.mockResolvedValue({ ok: true, surveyStatus: "published" });
    Feedback.create.mockResolvedValue({ _id: "f1", orgId: "org1", day: new Date() });
    await feedbackService.submit({ orgId: "org1", userId: "u1", surveyId: "s1", answers: [{ questionId: "q1", value: "5" }] });
    expect(surveyClient.checkAndRecordParticipation).toHaveBeenCalledWith({ orgId: "org1", userId: "u1", departmentId: undefined, surveyId: "s1" });
    expect(Feedback.create.mock.calls[0][0]).not.toHaveProperty("userId");
  });

  it("propagates a survey validation error (e.g. already participated) without creating feedback", async () => {
    const { ApiError } = require("@sentilens/shared");
    surveyClient.checkAndRecordParticipation.mockRejectedValue(new ApiError(409, "ALREADY_PARTICIPATED", "already answered"));
    await expect(feedbackService.submit({ orgId: "org1", userId: "u1", surveyId: "s1" })).rejects.toMatchObject({ status: 409 });
    expect(Feedback.create).not.toHaveBeenCalled();
  });

  it("does not fail the submission if enqueueing analysis fails (feedback must not be lost)", async () => {
    Feedback.create.mockResolvedValue({ _id: "f1", orgId: "org1", day: new Date() });
    analysisClient.enqueue.mockRejectedValue(new Error("analysis-service down"));
    await expect(feedbackService.submit({ orgId: "org1", userId: "u1", comment: "fine" })).resolves.toMatchObject({ feedbackId: "f1" });
  });

  it("returns a receipt code the caller can later look up", async () => {
    Feedback.create.mockResolvedValue({ _id: "f1", orgId: "org1", day: new Date() });
    const result = await feedbackService.submit({ orgId: "org1", userId: "u1", comment: "fine" });
    expect(result.receiptCode).toMatch(/^[0-9A-F]{12}$/);
  });
});

describe("statusByReceipt", () => {
  it("scopes the lookup to the caller's org (no cross-tenant receipt guessing)", async () => {
    const select = jest.fn().mockResolvedValue({ analysisStatus: "done", createdAt: new Date() });
    Feedback.findOne.mockReturnValue({ select });
    await feedbackService.statusByReceipt("org1", "ABCDEF123456");
    expect(Feedback.findOne).toHaveBeenCalledWith({ orgId: "org1", receiptHash: expect.any(String) });
  });

  it("404s on an unknown receipt", async () => {
    Feedback.findOne.mockReturnValue({ select: () => Promise.resolve(null) });
    await expect(feedbackService.statusByReceipt("org1", "AAAAAAAAAAAA")).rejects.toMatchObject({ status: 404 });
  });
});
