jest.mock("../src/models/DailyStat");
jest.mock("../src/services/orgClient");
const DailyStat = require("../src/models/DailyStat");
const orgClient = require("../src/services/orgClient");
const stats = require("../src/services/statsService");

function rows(list) {
  DailyStat.find.mockReturnValue({ sort: () => ({ lean: () => Promise.resolve(list) }) });
}
const row = (count, sentiment = {}, aspects = {}, emotions = {}) => ({
  date: new Date("2026-06-01"), count,
  sentiment: { positive: 0, neutral: 0, negative: 0, mixed: 0, ...sentiment },
  emotions: { joy: 0, satisfaction: 0, frustration: 0, anger: 0, sadness: 0, fear: 0, surprise: 0, neutral: 0, ...emotions },
  aspects,
});

beforeEach(() => { jest.clearAllMocks(); orgClient.getMinGroupSize.mockResolvedValue(5); });

describe("overview computed from rollup rows (nothing hardcoded)", () => {
  it("derives totals and percentages from the stored counts", async () => {
    rows([row(100, { positive: 61, neutral: 22, negative: 12, mixed: 5 }, { workload: { mentions: 38, negative: 30 }, team: { mentions: 21, positive: 20 } })]);
    const o = await stats.overview("org1", {});
    expect(o.totalFeedback).toBe(100);
    expect(o.sentiment).toEqual({ positive: 61, neutral: 22, negative: 12, mixed: 5 });
    expect(o.topAspects[0]).toEqual({ key: "workload", mentions: 38 });
  });

  it("sums multiple days", async () => {
    rows([row(10, { positive: 10 }), row(10, { negative: 10 })]);
    const o = await stats.overview("org1", {});
    expect(o.totalFeedback).toBe(20);
    expect(o.sentiment.positive).toBe(50);
    expect(o.sentiment.negative).toBe(50);
  });

  it("returns zeros, not NaN, when there is no data", async () => {
    rows([]);
    const o = await stats.overview("org1", {});
    expect(o.totalFeedback).toBe(0);
    expect(o.sentiment.positive).toBe(0);
  });
});

describe("k-anonymity threshold on department-filtered queries", () => {
  it("suppresses when the department has fewer responses than the threshold (the 4-response scenario)", async () => {
    rows([row(4, { positive: 4 })]);
    const o = await stats.overview("org1", { departmentId: "deptA" });
    expect(o).toEqual({ privacy: { suppressed: true, reason: "Not enough responses to protect anonymity.", minGroupSize: 5, count: 4 } });
    expect(o.sentiment).toBeUndefined();
  });

  it("shows data at exactly the threshold", async () => {
    rows([row(5, { positive: 5 })]);
    const o = await stats.overview("org1", { departmentId: "deptA" });
    expect(o.privacy.suppressed).toBe(false);
    expect(o.totalFeedback).toBe(5);
  });

  it("applies to every endpoint, not just overview", async () => {
    rows([row(3)]);
    for (const fn of ["sentimentBreakdown", "emotionBreakdown", "aspectBreakdown", "trendSeries"]) {
      const r = await stats[fn]("org1", { departmentId: "deptA" });
      expect(r.privacy.suppressed).toBe(true);
    }
  });

  it("does not consult the threshold for org-wide queries", async () => {
    rows([row(2)]);
    const o = await stats.overview("org1", {});
    expect(orgClient.getMinGroupSize).not.toHaveBeenCalled();
    expect(o.privacy.suppressed).toBe(false);
  });
});

describe("department comparison with complementary suppression", () => {
  function perDept(map) {
    DailyStat.find.mockImplementation((q) => ({ sort: () => ({ lean: () => Promise.resolve([row(map[q.departmentId], { positive: map[q.departmentId] })]) }) }));
  }

  it("hides every small department", async () => {
    perDept({ A: 4, B: 20, C: 30 });
    const r = await stats.departmentComparison("org1", {}, ["A", "B", "C"]);
    expect(r.departments.find((d) => d.departmentId === "A").privacy.suppressed).toBe(true);
  });

  it("also hides the next-smallest visible department when exactly one is hidden (blocks subtraction attacks)", async () => {
    perDept({ A: 4, B: 20, C: 30 });
    const r = await stats.departmentComparison("org1", {}, ["A", "B", "C"]);
    const byId = Object.fromEntries(r.departments.map((d) => [d.departmentId, d.privacy.suppressed]));
    expect(byId).toEqual({ A: true, B: true, C: false });
  });

  it("does not add complementary suppression when two or more are already hidden", async () => {
    perDept({ A: 2, B: 3, C: 30, D: 40 });
    const r = await stats.departmentComparison("org1", {}, ["A", "B", "C", "D"]);
    const byId = Object.fromEntries(r.departments.map((d) => [d.departmentId, d.privacy.suppressed]));
    expect(byId).toEqual({ A: true, B: true, C: false, D: false });
  });

  it("shows everything when all departments meet the threshold", async () => {
    perDept({ A: 10, B: 20 });
    const r = await stats.departmentComparison("org1", {}, ["A", "B"]);
    expect(r.departments.every((d) => !d.privacy.suppressed)).toBe(true);
  });
});
