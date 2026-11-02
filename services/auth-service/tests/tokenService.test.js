jest.mock("../src/models/RefreshToken", () => ({ create: jest.fn(), findOne: jest.fn(), updateMany: jest.fn() }));
const RefreshToken = require("../src/models/RefreshToken");
const tokens = require("../src/services/tokenService");

describe("access tokens", () => {
  it("round-trips claims and rejects tampering", () => {
    const t = tokens.signAccessToken({ _id: "u1", orgId: "o1", role: "hr" });
    const payload = tokens.verifyAccessToken(t);
    expect(payload).toMatchObject({ sub: "u1", orgId: "o1", role: "hr" });
    expect(() => tokens.verifyAccessToken(t + "x")).toThrow();
  });
});

describe("refresh token rotation", () => {
  afterEach(() => jest.clearAllMocks());

  it("rejects an unknown token", async () => {
    RefreshToken.findOne.mockResolvedValue(null);
    await expect(tokens.rotateRefreshToken("nope")).rejects.toThrow("INVALID");
  });

  it("rejects an expired token", async () => {
    RefreshToken.findOne.mockResolvedValue({ revokedAt: null, expiresAt: new Date(Date.now() - 1000) });
    await expect(tokens.rotateRefreshToken("old")).rejects.toThrow("INVALID");
  });

  it("detects reuse of an already-revoked token and revokes the whole family", async () => {
    RefreshToken.findOne.mockResolvedValue({ revokedAt: new Date(), family: "fam-1", expiresAt: new Date(Date.now() + 10000) });
    await expect(tokens.rotateRefreshToken("stolen")).rejects.toThrow("REUSE_DETECTED");
    expect(RefreshToken.updateMany).toHaveBeenCalledWith({ family: "fam-1", revokedAt: null }, { revokedAt: expect.any(Date) });
  });

  it("rotates a valid token: marks it revoked and returns its userId/family", async () => {
    const save = jest.fn();
    RefreshToken.findOne.mockResolvedValue({ revokedAt: null, family: "fam-1", userId: "u1", expiresAt: new Date(Date.now() + 10000), save });
    const result = await tokens.rotateRefreshToken("valid");
    expect(result).toEqual({ userId: "u1", family: "fam-1" });
    expect(save).toHaveBeenCalled();
  });
});
