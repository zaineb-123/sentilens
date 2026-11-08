import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useAuth } from "@/features/auth/AuthContext";
import { addReceipt, isValidCode, parseReceipts, removeReceipt } from "./receiptHelpers";

/**
 * "My feedback" history, kept ONLY in this browser (localStorage) - never sent to the server, so the
 * server cannot learn which feedback belongs to whom. It stores just the receipt code and when it was
 * saved, never the message text. Keyed per user so a colleague signing in on a shared computer sees
 * nothing of yours. On by default; can be switched off or erased from the Privacy page.
 */
export type { SavedReceipt } from "./receiptHelpers";
const listKey = (uid: string) => `sentilens:receipts:v1:${uid}`;
const flagKey = (uid: string) => `sentilens:receipts:enabled:${uid}`;

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
function read(key: string): string | null { try { return localStorage.getItem(key); } catch { return null; } }
function write(key: string, value: string | null) {
  // Storage can be unavailable (private mode, quota): the history is then simply not kept.
  try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch { /* ignore */ }
  emit();
}
const subscribe = (cb: () => void) => {
  listeners.add(cb); window.addEventListener("storage", cb);
  return () => { listeners.delete(cb); window.removeEventListener("storage", cb); };
};

export function useReceiptHistory() {
  const { user } = useAuth();
  const uid = user?._id;
  const rawList = useSyncExternalStore(subscribe, () => (uid ? read(listKey(uid)) ?? "" : ""), () => "");
  const rawFlag = useSyncExternalStore(subscribe, () => (uid ? read(flagKey(uid)) ?? "" : ""), () => "");
  const items = useMemo(() => parseReceipts(rawList), [rawList]);
  const enabled = rawFlag !== "0";

  /** Returns true when the code is now in the history. */
  const add = useCallback((code: string) => {
    if (!uid || read(flagKey(uid)) === "0") return false;
    const next = addReceipt(parseReceipts(read(listKey(uid))), code);
    if (!isValidCode(code)) return false;
    write(listKey(uid), JSON.stringify(next)); return true;
  }, [uid]);
  const remove = useCallback((code: string) => { if (uid) write(listKey(uid), JSON.stringify(removeReceipt(parseReceipts(read(listKey(uid))), code))); }, [uid]);
  const clear = useCallback(() => { if (uid) write(listKey(uid), null); }, [uid]);
  const setEnabled = useCallback((on: boolean) => { if (uid) write(flagKey(uid), on ? null : "0"); }, [uid]);
  return { items, enabled, add, remove, clear, setEnabled };
}
