const SCHEMA_VERSION = 1;

export type StorageKey = "company" | "clients" | "invoices" | "offers";

const KEYS: Record<StorageKey, string> = {
  company: "astra.company",
  clients: "astra.clients",
  invoices: "astra.invoices",
  offers: "astra.offers",
};

/** Same-tab pub/sub — the browser's native `storage` event only fires cross-tab. */
export const storeEvents = new EventTarget();

function isBrowser() {
  return typeof window !== "undefined";
}

function readRaw<T>(key: StorageKey): T | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(KEYS[key]);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { schemaVersion: number; data: T };
    return parsed.data;
  } catch {
    return null;
  }
}

function writeRaw<T>(key: StorageKey, data: T): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(KEYS[key], JSON.stringify({ schemaVersion: SCHEMA_VERSION, data }));
  storeEvents.dispatchEvent(new Event("change"));
}

export function readSingle<T>(key: StorageKey): T | null {
  return readRaw<T>(key);
}

export function writeSingle<T>(key: StorageKey, data: T): void {
  writeRaw(key, data);
}

export function listCollection<T>(key: StorageKey): T[] {
  return readRaw<T[]>(key) ?? [];
}

export function saveCollection<T>(key: StorageKey, items: T[]): void {
  writeRaw(key, items);
}

/** Generates the next sequential document number, e.g. "RE-2026-0007". */
export function nextDocumentNumber(prefix: string, existing: { number: string }[]): string {
  const year = new Date().getFullYear();
  const yearPrefix = `${prefix}-${year}-`;
  const maxSeq = existing
    .filter((item) => item.number.startsWith(yearPrefix))
    .map((item) => Number(item.number.slice(yearPrefix.length)))
    .filter((n) => Number.isFinite(n))
    .reduce((max, n) => Math.max(max, n), 0);
  return `${yearPrefix}${String(maxSeq + 1).padStart(4, "0")}`;
}
