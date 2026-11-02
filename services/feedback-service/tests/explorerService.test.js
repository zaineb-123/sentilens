jest.mock("../src/models/Feedback");
jest.mock("../src/services/orgClient");
const Feedback = require("../src/models/Feedback");
const orgClient = require("../src/services/orgClient");
const explorerService = require("../src/services/explorerService");

beforeEach(() => jest.clearAllMocks());

describe("k-anonymity threshold gating", () => {
  it("suppresses department-level results when below the org's minimum group size", async () => {
    Feedback.countDocuments.mockResolvedValue(4);
    orgClient.getMinGroupSize.mockResolvedValue(5);
    const result = await explorerService.explore("org1", { departmentId: "d1" });
    expect(result).toMatchObject({ suppressed: true, reason: "Not enough responses to protect anonymity.", minGroupSize: 5, count: 4, items: [] });
  });

  it("returns results once the group meets the threshold", async () => {
    Feedback.countDocuments.mockResolvedValue(9);
    orgClient.getMinGroupSize.mockResolvedValue(5);
    Feedback.find.mockReturnValue({ select: () => ({ sort: () => ({ limit: () => ({ lean: () => Promise.resolve([{ comment: "a" }, { comment: "b" }]) }) }) }) });
    const result = await explorerService.explore("org1", { departmentId: "d1" });
    expect(result.suppressed).toBe(false);
    expect(result.items).toHaveLength(2);
  });

  it("does not apply the threshold check when no department filter is given (org-wide view)", async () => {
    Feedback.find.mockReturnValue({ select: () => ({ sort: () => ({ limit: () => ({ lean: () => Promise.resolve([]) }) }) }) });
    const result = await explorerService.explore("org1", {});
    expect(orgClient.getMinGroupSize).not.toHaveBeenCalled();
    expect(result.suppressed).toBe(false);
  });
});
