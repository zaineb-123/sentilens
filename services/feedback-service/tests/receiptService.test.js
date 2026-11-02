const { generateReceipt, hashReceipt, roundToDay } = require("../src/services/receiptService");

describe("receipt generation", () => {
  it("produces a code whose hash matches hashReceipt", () => {
    const { code, hash } = generateReceipt();
    expect(hashReceipt(code)).toBe(hash);
  });

  it("is case- and whitespace-insensitive on lookup", () => {
    const { code, hash } = generateReceipt();
    expect(hashReceipt(`  ${code.toLowerCase()}  `)).toBe(hash);
  });

  it("generates different codes each time", () => {
    const a = generateReceipt();
    const b = generateReceipt();
    expect(a.code).not.toBe(b.code);
  });
});

describe("day rounding (privacy: no exact timestamps stored)", () => {
  it("rounds to midnight UTC", () => {
    const d = roundToDay(new Date("2026-06-15T14:37:22.123Z"));
    expect(d.toISOString()).toBe("2026-06-15T00:00:00.000Z");
  });
});
