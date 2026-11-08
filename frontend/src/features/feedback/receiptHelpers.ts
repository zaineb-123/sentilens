/** Pure receipt-history helpers (no React, no auth) so they can be tested without a browser. */
export interface SavedReceipt { code: string; savedAt: string }

const MAX_ITEMS = 100;
const CODE_RE = /^[0-9A-F]{12}$/;
export const normalizeCode = (raw: string) => raw.trim().toUpperCase();
export const isValidCode = (raw: string) => CODE_RE.test(normalizeCode(raw));

export function parseReceipts(raw: string | null | undefined): SavedReceipt[] {
  try {
    const data = JSON.parse(raw || "[]");
    if (!Array.isArray(data)) return [];
    return data
      .filter((x) => x && typeof x.code === "string" && isValidCode(x.code) && typeof x.savedAt === "string")
      .map((x) => ({ code: normalizeCode(x.code), savedAt: x.savedAt }));
  } catch { return []; }
}
/** Adds a code at the top (newest first). A code already saved keeps its original date. */
export function addReceipt(list: SavedReceipt[], code: string, now = new Date()): SavedReceipt[] {
  const c = normalizeCode(code);
  if (!isValidCode(c) || list.some((r) => r.code === c)) return list;
  return [{ code: c, savedAt: now.toISOString() }, ...list].slice(0, MAX_ITEMS);
}
export const removeReceipt = (list: SavedReceipt[], code: string) => list.filter((r) => r.code !== normalizeCode(code));
