// Client-side rate limiting + offline cache via IndexedDB (idb-keyval-style).
// Suited for 3G context: prevents abuse and caches last 50 verifications.

const DB_NAME = "traceimei-bj";
const STORE = "kv";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function get<T>(key: string): Promise<T | undefined> {
  try {
    const db = await openDb();
    return await new Promise<T | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const r = tx.objectStore(STORE).get(key);
      r.onsuccess = () => resolve(r.result as T | undefined);
      r.onerror = () => reject(r.error);
    });
  } catch {
    return undefined;
  }
}

async function set<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    /* ignore */
  }
}

// ---------- Rate limiting ----------

const RATE_KEY = "rate:checks";
const MAX_PER_HOUR = 30;
const WINDOW_MS = 60 * 60 * 1000;

export interface RateStatus {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}

export async function checkRate(): Promise<RateStatus> {
  const now = Date.now();
  const stamps = ((await get<number[]>(RATE_KEY)) ?? []).filter((t) => now - t < WINDOW_MS);
  if (stamps.length >= MAX_PER_HOUR) {
    const oldest = stamps[0];
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.ceil((WINDOW_MS - (now - oldest)) / 1000),
    };
  }
  return { allowed: true, remaining: MAX_PER_HOUR - stamps.length, retryAfterSec: 0 };
}

export async function recordCheck(): Promise<void> {
  const now = Date.now();
  const stamps = ((await get<number[]>(RATE_KEY)) ?? []).filter((t) => now - t < WINDOW_MS);
  stamps.push(now);
  await set(RATE_KEY, stamps);
}

// ---------- Offline cache (last 50 verifications) ----------

const CACHE_KEY = "cache:verifications";
const CACHE_MAX = 50;

export interface CachedVerification {
  imei: string;
  status: "safe" | "suspect" | "stolen";
  scorePercent: number;
  cachedAt: number;
  brand?: string;
  model?: string;
}

export async function cacheVerification(v: CachedVerification): Promise<void> {
  const list = ((await get<CachedVerification[]>(CACHE_KEY)) ?? []).filter(
    (x) => x.imei !== v.imei,
  );
  list.unshift(v);
  await set(CACHE_KEY, list.slice(0, CACHE_MAX));
}

export async function getCachedVerification(imei: string): Promise<CachedVerification | null> {
  const list = (await get<CachedVerification[]>(CACHE_KEY)) ?? [];
  return list.find((x) => x.imei === imei) ?? null;
}

export async function getCachedList(): Promise<CachedVerification[]> {
  return (await get<CachedVerification[]>(CACHE_KEY)) ?? [];
}
