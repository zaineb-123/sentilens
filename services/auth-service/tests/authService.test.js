jest.mock("../src/models/User");
jest.mock("../src/models/Invitation");
jest.mock("../src/models/PasswordReset");
jest.mock("../src/services/tokenService");

const bcrypt = require("bcryptjs");
const User = require("../src/models/User");
const Invitation = require("../src/models/Invitation");
const PasswordReset = require("../src/models/PasswordReset");
const tokens = require("../src/services/tokenService");
const authService = require("../src/services/authService");

beforeEach(() => {
  jest.clearAllMocks();
  tokens.signAccessToken.mockReturnValue("access-token");
  tokens.issueRefreshFamily.mockResolvedValue({ raw: "refresh-token", family: "fam", expiresAt: new Date() });
  tokens.hashToken.mockImplementation((s) => "hash:" + s);
});

describe("register", () => {
  it("rejects an invalid or already-used invitation", async () => {
    Invitation.findOne.mockResolvedValue(null);
    await expect(authService.register({ email: "a@b.com", password: "longenoughpassword", invitationCode: "x" }))
      .rejects.toMatchObject({ status: 400, code: "INVALID_INVITATION" });
  });

  it("rejects a duplicate email even with a valid invitation", async () => {
    Invitation.findOne.mockResolvedValue({ consumedAt: null, expiresAt: new Date(Date.now() + 10000), role: "employee", orgId: "o1" });
    User.findOne.mockResolvedValue({ _id: "existing" });
    await expect(authService.register({ email: "a@b.com", password: "longenoughpassword", invitationCode: "x" }))
      .rejects.toMatchObject({ status: 409 });
  });

  it("creates the user with the role/org from the invitation, not from client input", async () => {
    const invite = { consumedAt: null, expiresAt: new Date(Date.now() + 10000), role: "hr", orgId: "org-9", save: jest.fn() };
    Invitation.findOne.mockResolvedValue(invite);
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ _id: "u1", role: "hr", orgId: "org-9" });

    const session = await authService.register({ email: "a@b.com", password: "longenoughpassword", invitationCode: "x" });

    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ role: "hr", orgId: "org-9", status: "active" }));
    expect(invite.consumedAt).toBeInstanceOf(Date);
    expect(session).toMatchObject({ accessToken: "access-token", refreshToken: "refresh-token" });
  });
});

describe("login", () => {
  it("rejects a wrong password without revealing whether the account exists", async () => {
    const hash = await bcrypt.hash("correct-password", 4);
    User.findOne.mockResolvedValue({ passwordHash: hash, status: "active", save: jest.fn() });
    await expect(authService.login({ email: "a@b.com", password: "wrong-password" }))
      .rejects.toMatchObject({ status: 401 });
  });

  it("rejects login for an unknown email with the same error as a wrong password", async () => {
    User.findOne.mockResolvedValue(null);
    await expect(authService.login({ email: "nobody@b.com", password: "whatever12345" }))
      .rejects.toMatchObject({ status: 401 });
  });

  it("rejects a disabled account even with the correct password", async () => {
    const hash = await bcrypt.hash("correct-password", 4);
    User.findOne.mockResolvedValue({ passwordHash: hash, status: "disabled", save: jest.fn() });
    await expect(authService.login({ email: "a@b.com", password: "correct-password" }))
      .rejects.toMatchObject({ status: 401 });
  });

  it("issues a session and stamps lastLoginAt on success", async () => {
    const hash = await bcrypt.hash("correct-password", 4);
    const user = { passwordHash: hash, status: "active", save: jest.fn(), lastLoginAt: null };
    User.findOne.mockResolvedValue(user);
    const session = await authService.login({ email: "a@b.com", password: "correct-password" });
    expect(user.lastLoginAt).toBeInstanceOf(Date);
    expect(user.save).toHaveBeenCalled();
    expect(session.accessToken).toBe("access-token");
  });
});

describe("password reset", () => {
  it("does not reveal whether the account exists", async () => {
    User.findOne.mockResolvedValue(null);
    await expect(authService.forgotPassword("nobody@b.com")).resolves.toBeNull();
    expect(PasswordReset.create).not.toHaveBeenCalled();
  });

  it("rejects an expired or already-used reset token", async () => {
    PasswordReset.findOne.mockResolvedValue({ usedAt: new Date(), expiresAt: new Date(Date.now() + 10000) });
    await expect(authService.resetPassword({ token: "t", password: "newlongpassword" }))
      .rejects.toMatchObject({ status: 400, code: "INVALID_RESET_TOKEN" });
  });

  it("updates the password and revokes every existing session", async () => {
    const save = jest.fn();
    PasswordReset.findOne.mockResolvedValue({ usedAt: null, expiresAt: new Date(Date.now() + 10000), userId: "u1", save });
    const userSave = jest.fn();
    User.findById.mockResolvedValue({ _id: "u1", save: userSave, passwordHash: "old" });

    await authService.resetPassword({ token: "t", password: "newlongpassword" });

    expect(userSave).toHaveBeenCalled();
    expect(tokens.revokeAllForUser).toHaveBeenCalledWith("u1");
  });
});
