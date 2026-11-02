jest.mock("../src/models/Organization");
const Organization = require("../src/models/Organization");
const { getMinGroupSize } = require("../src/services/thresholdService");

describe("k-anonymity threshold resolution", () => {
  it("uses the org-configured value when present", async () => {
    Organization.findById.mockReturnValue({ select: () => ({ lean: () => Promise.resolve({ settings: { minGroupSize: 8 } }) }) });
    await expect(getMinGroupSize("org1")).resolves.toBe(8);
  });

  it("falls back to the default when the org has no explicit setting", async () => {
    Organization.findById.mockReturnValue({ select: () => ({ lean: () => Promise.resolve({ settings: {} }) }) });
    await expect(getMinGroupSize("org1")).resolves.toBe(5);
  });

  it("never returns below the hard floor of 3, even if bad data slipped in", async () => {
    Organization.findById.mockReturnValue({ select: () => ({ lean: () => Promise.resolve({ settings: { minGroupSize: 1 } }) }) });
    await expect(getMinGroupSize("org1")).resolves.toBe(3);
  });
});
