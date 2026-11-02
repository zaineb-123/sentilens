describe("mailerService", () => {
  afterEach(() => { jest.resetModules(); delete process.env.SMTP_HOST; });

  it("is a no-op when SMTP_HOST is not configured (default in tests/env.setup.js)", async () => {
    const mailer = require("../src/services/mailerService");
    const result = await mailer.sendEmail({ to: "hr@acme.com", subject: "x", text: "y" });
    expect(result).toEqual({ sent: false });
  });

  it("is a no-op when no recipient is given, even with SMTP configured", async () => {
    process.env.SMTP_HOST = "localhost";
    jest.resetModules();
    const mailer = require("../src/services/mailerService");
    const result = await mailer.sendEmail({ to: null, subject: "x", text: "y" });
    expect(result).toEqual({ sent: false });
  });
});
