jest.mock("../src/models/Job");
jest.mock("../src/models/Analysis");
jest.mock("../src/services/feedbackClient");
jest.mock("../src/services/aiClient");
jest.mock("../src/services/analyticsClient");

const Job = require("../src/models/Job");
const Analysis = require("../src/models/Analysis");
const feedbackClient = require("../src/services/feedbackClient");
const aiClient = require("../src/services/aiClient");
const analyticsClient = require("../src/services/analyticsClient");
const worker = require("../src/services/worker");

const feedbackItem = {
  _id: "f1", orgId: "org1", departmentId: "d1", surveyId: null,
  comment: "I love the team but the workload is too high.", day: new Date("2026-06-01"),
};

const aiResponse = {
  language: { code: "en", script: "latin", confidence: 0.99, dialect: null, experimental: false },
  sentiment: { label: "mixed", confidence: 0.8, scores: { positive: 0.4, neutral: 0.1, negative: 0.5 } },
  emotions: { primary: "frustration", scores: [{ label: "frustration", score: 0.6 }] },
  aspects: [{ key: "team", label: { en: "Team" }, type: "fixed", sentiment: "positive", confidence: 0.9, mentions: 1 }],
  meta: { engine: "transformers", models: { sentiment: "x" }, clauses: 2, processing_ms: 42.5 },
};

beforeEach(() => {
  jest.clearAllMocks();
  analyticsClient.ingest.mockResolvedValue(undefined);
});

describe("processOne: happy path", () => {
  it("analyzes the feedback, stores the result, marks the job done, and reports back", async () => {
    const jobSave = jest.fn();
    Job.findOneAndUpdate.mockResolvedValue({ attempts: 1, save: jobSave });
    aiClient.analyze.mockResolvedValue(aiResponse);
    Analysis.findOneAndUpdate.mockResolvedValue({ feedbackId: "f1", sentiment: aiResponse.sentiment });
    feedbackClient.reportStatus.mockResolvedValue(undefined);

    const result = await worker.processOne(feedbackItem);

    expect(aiClient.analyze).toHaveBeenCalledWith(feedbackItem.comment);
    expect(Analysis.findOneAndUpdate).toHaveBeenCalledWith(
      { feedbackId: "f1" },
      expect.objectContaining({ orgId: "org1", departmentId: "d1", sentiment: aiResponse.sentiment, engine: "transformers" }),
      { upsert: true, new: true },
    );
    expect(jobSave).toHaveBeenCalled();
    expect(feedbackClient.reportStatus).toHaveBeenCalledWith("f1", "done");
    expect(analyticsClient.ingest).toHaveBeenCalled();
    expect(result).toEqual({ ok: true });
  });
});

describe("processOne: AI failure with retries remaining", () => {
  it("marks the job pending (not failed) so it will be reclaimed, and reports pending to Feedback Service", async () => {
    const jobSave = jest.fn();
    Job.findOneAndUpdate.mockResolvedValue({ attempts: 1, save: jobSave, status: undefined, lastError: null });
    aiClient.analyze.mockRejectedValue(new Error("ai-service unreachable: fetch failed"));

    const result = await worker.processOne(feedbackItem);

    expect(result.ok).toBe(false);
    expect(result.exhausted).toBe(false);
    expect(feedbackClient.reportStatus).toHaveBeenCalledWith("f1", "pending");
    expect(Analysis.findOneAndUpdate).not.toHaveBeenCalled();
  });
});

describe("processOne: AI failure with attempts exhausted", () => {
  it("marks the job permanently failed once MAX_ATTEMPTS is reached", async () => {
    const jobSave = jest.fn();
    Job.findOneAndUpdate.mockResolvedValue({ attempts: 3, save: jobSave }); // MAX_ATTEMPTS=3 in tests/env.setup.js
    aiClient.analyze.mockRejectedValue(new Error("ai-service error 503"));

    const result = await worker.processOne(feedbackItem);

    expect(result.exhausted).toBe(true);
    expect(feedbackClient.reportStatus).toHaveBeenCalledWith("f1", "failed");
  });

  it("never throws even if reporting the failure back to Feedback Service also fails", async () => {
    Job.findOneAndUpdate.mockResolvedValue({ attempts: 3, save: jest.fn() });
    aiClient.analyze.mockRejectedValue(new Error("boom"));
    feedbackClient.reportStatus.mockRejectedValue(new Error("feedback-service also down"));
    await expect(worker.processOne(feedbackItem)).resolves.toMatchObject({ ok: false });
  });
});

describe("runOnce", () => {
  it("claims a batch and processes each item in order", async () => {
    feedbackClient.claimPending.mockResolvedValue([feedbackItem, { ...feedbackItem, _id: "f2" }]);
    Job.findOneAndUpdate.mockResolvedValue({ attempts: 1, save: jest.fn() });
    aiClient.analyze.mockResolvedValue(aiResponse);
    Analysis.findOneAndUpdate.mockResolvedValue({});
    feedbackClient.reportStatus.mockResolvedValue(undefined);

    const summary = await worker.runOnce(10);

    expect(feedbackClient.claimPending).toHaveBeenCalledWith(10);
    expect(summary.claimed).toBe(2);
    expect(summary.results).toEqual([{ ok: true }, { ok: true }]);
  });

  it("processes zero items gracefully when nothing is pending", async () => {
    feedbackClient.claimPending.mockResolvedValue([]);
    const summary = await worker.runOnce(5);
    expect(summary).toEqual({ claimed: 0, results: [] });
    expect(aiClient.analyze).not.toHaveBeenCalled();
  });
});
