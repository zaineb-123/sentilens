const analysis = {
  feedbackId: "f1", orgId: "org1", departmentId: "dept1", surveyId: null, day: new Date(), engine: "x", modelVersions: {},
  language: { code: "fr", confidence: 0.99 },
  sentiment: { label: "negative", confidence: 0.91, scores: { positive: 0.02, neutral: 0.07, negative: 0.91 } },
  emotions: { primary: "fear", scores: [{ label: "fear", score: 0.7 }, { label: "sadness", score: 0.2 }] },
  aspects: [{ key: "workload", label: { fr: "Charge" }, type: "fixed", sentiment: "negative", confidence: 0.9, mentions: 1 }],
};

function load() {
  jest.resetModules();
  process.env.ANALYSIS_SERVICE_URL = "http://analysis:4005";
  process.env.INTERNAL_SERVICE_KEY = "k";
  return require("../src/services/analysisClient");
}
afterEach(() => { delete global.fetch; });

describe("analysisClient.getResult", () => {
  it("returns only what the author needs - never feedbackId, orgId or departmentId", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ analysis }) });
    const out = await load().getResult("f1");
    expect(out.sentiment.label).toBe("negative");
    expect(out.emotions.primary).toBe("fear");
    expect(out.aspects[0]).toEqual({ key: "workload", label: { fr: "Charge" }, sentiment: "negative" });
    const json = JSON.stringify(out);
    for (const leak of ["feedbackId", "orgId", "departmentId", "org1", "dept1", "modelVersions"]) expect(json).not.toContain(leak);
    expect(global.fetch.mock.calls[0][1].headers["X-Internal-Key"]).toBe("k");
  });

  it("returns null when there is no analysis yet, on HTTP errors and on network failures", async () => {
    const { getResult } = load();
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ analysis: null }) });
    expect(await getResult("f1")).toBeNull();
    global.fetch = jest.fn().mockResolvedValue({ ok: false });
    expect(await getResult("f1")).toBeNull();
    global.fetch = jest.fn().mockRejectedValue(new Error("down"));
    expect(await getResult("f1")).toBeNull();
  });
});
