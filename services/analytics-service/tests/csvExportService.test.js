const { buildReportCsv, rowsToCsv } = require("../src/services/csvExportService");

describe("rowsToCsv", () => {
  it("joins rows with commas and CRLF between rows", () => {
    expect(rowsToCsv([["a", 1], ["b", 2]])).toBe("a,1\r\nb,2\r\n");
  });
  it("quotes and escapes fields containing commas, quotes, or newlines", () => {
    expect(rowsToCsv([['He said "hi", bye']])).toBe('"He said ""hi"", bye"\r\n');
  });
  it("renders an empty row as a blank line (used as a section separator)", () => {
    expect(rowsToCsv([["a"], [], ["b"]])).toBe("a\r\n\r\nb\r\n");
  });
});

describe("buildReportCsv", () => {
  it("includes the overview totals and every aspect row, derived only from the data passed in", () => {
    const overview = { totalFeedback: 248, sentiment: { positive: 61, neutral: 22, negative: 12, mixed: 5 } };
    const aspects = { aspects: [{ key: "workload", mentions: 38, sentiment: { positive: 10, neutral: 0, negative: 85, mixed: 5 } }] };
    const csv = buildReportCsv(overview, aspects);
    expect(csv).toContain("total_feedback,248");
    expect(csv).toContain("positive_pct,61");
    expect(csv).toContain("workload,38,10,0,85,5");
  });
  it("does not crash on an empty aspect list", () => {
    const csv = buildReportCsv({ totalFeedback: 0, sentiment: {} }, {});
    expect(csv).toContain("total_feedback,");
  });
});
