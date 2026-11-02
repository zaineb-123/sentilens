jest.mock("../src/models/DailyStat");
jest.mock("../src/models/IngestedFeedback");
const DailyStat = require("../src/models/DailyStat");
const IngestedFeedback = require("../src/models/IngestedFeedback");
const { ingest, buildIncrements } = require("../src/services/ingestService");

const analysis = {
  feedbackId: "f1", orgId: "org1", departmentId: "d1", day: new Date("2026-06-01"),
  sentiment: { label: "mixed" }, emotions: { primary: "frustration" },
  aspects: [{ key: "team", sentiment: "positive" }, { key: "workload", sentiment: "negative" }],
};

beforeEach(() => { jest.clearAllMocks(); DailyStat.findOneAndUpdate.mockResolvedValue({}); });

describe("buildIncrements", () => {
  it("counts the sentiment label, primary emotion, and each aspect's mention + sentiment", () => {
    expect(buildIncrements(analysis)).toEqual({
      count: 1, "sentiment.mixed": 1, "emotions.frustration": 1,
      "aspects.team.mentions": 1, "aspects.team.positive": 1,
      "aspects.workload.mentions": 1, "aspects.workload.negative": 1,
    });
  });
});

describe("ingest", () => {
  it("updates both the org-wide rollup (departmentId null) and the department rollup", async () => {
    IngestedFeedback.create.mockResolvedValue({});
    await ingest(analysis);
    const calls = DailyStat.findOneAndUpdate.mock.calls;
    expect(calls).toHaveLength(2);
    expect(calls[0][0]).toMatchObject({ orgId: "org1", departmentId: null });
    expect(calls[1][0]).toMatchObject({ orgId: "org1", departmentId: "d1" });
  });

  it("only updates the org-wide rollup when the feedback has no department", async () => {
    IngestedFeedback.create.mockResolvedValue({});
    await ingest({ ...analysis, departmentId: null });
    expect(DailyStat.findOneAndUpdate).toHaveBeenCalledTimes(1);
  });

  it("is idempotent: a duplicate push for the same feedbackId does not double count", async () => {
    IngestedFeedback.create.mockRejectedValue(Object.assign(new Error("dup"), { code: 11000 }));
    const result = await ingest(analysis);
    expect(result).toEqual({ alreadyIngested: true });
    expect(DailyStat.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("propagates unexpected errors instead of swallowing them", async () => {
    IngestedFeedback.create.mockRejectedValue(new Error("db down"));
    await expect(ingest(analysis)).rejects.toThrow("db down");
  });
});
