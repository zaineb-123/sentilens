const { maskPii } = require("../src/services/piiMasking");

describe("PII masking", () => {
  it("masks an email address", () => {
    const r = maskPii("contact me at jane.doe@example.com please");
    expect(r.text).toBe("contact me at [email] please");
    expect(r.masked).toBe(true);
  });

  it("masks a phone number", () => {
    const r = maskPii("call me on +216 20 123 456 tomorrow");
    expect(r.text).toContain("[phone]");
    expect(r.text).not.toMatch(/\d{3,}/);
  });

  it("masks a URL", () => {
    const r = maskPii("see https://intranet.acme.com/profile/12345 for details");
    expect(r.text).toBe("see [link] for details");
  });

  it("masks multiple PII items in one comment", () => {
    const r = maskPii("email a@b.com or call 555-123-4567, see http://x.com");
    expect(r.text).toBe("email [email] or call [phone], see [link]");
  });

  it("leaves ordinary text untouched", () => {
    const r = maskPii("The team is great but the workload is heavy.");
    expect(r.text).toBe("The team is great but the workload is heavy.");
    expect(r.masked).toBe(false);
  });

  it("handles empty input", () => {
    expect(maskPii("")).toEqual({ text: "", masked: false });
    expect(maskPii(undefined)).toEqual({ text: "", masked: false });
  });
});
