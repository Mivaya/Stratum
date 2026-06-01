import type { RouteKey } from "./routeKey.js";
import { fallbackBucketId } from "./routeKey.js";

/** Snapshot of Discord rate-limit headers on a response. */
export interface RateLimitSnapshot {
  readonly bucketId: string;
  readonly limit: number;
  readonly remaining: number;
  /** Unix ms when the bucket resets. */
  readonly resetAt: number;
}

export interface RateLimitHeaders {
  bucket?: string | null;
  limit?: string | null;
  remaining?: string | null;
  reset?: string | null;
  resetAfter?: string | null;
  retryAfter?: string | null;
}

/** Parse Discord / fetch rate-limit headers into a snapshot. */
export function parseRateLimitHeaders(
  headers: RateLimitHeaders,
  routeKey: RouteKey,
  now = Date.now(),
): RateLimitSnapshot | null {
  const limit = headers.limit ? Number(headers.limit) : NaN;
  const remaining = headers.remaining ? Number(headers.remaining) : NaN;
  if (!Number.isFinite(limit) || !Number.isFinite(remaining)) return null;

  const resetAfterSec = headers.resetAfter ? Number(headers.resetAfter) : NaN;
  const resetEpochSec = headers.reset ? Number(headers.reset) : NaN;
  const resetAt = Number.isFinite(resetAfterSec)
    ? now + resetAfterSec * 1000
    : Number.isFinite(resetEpochSec)
      ? resetEpochSec * 1000
      : now;

  const bucketId = headers.bucket?.trim() || fallbackBucketId(routeKey);
  return { bucketId, limit, remaining, resetAt };
}

/** Mutable bucket state tracked by {@link RateLimitStore}. */
export class RateLimitBucket {
  readonly id: string;
  limit: number;
  remaining: number;
  resetAt: number;
  /** Block all requests until this timestamp (429 / manual). */
  blockedUntil = 0;

  constructor(id: string, limit = 1, remaining = 1, resetAt = 0) {
    this.id = id;
    this.limit = limit;
    this.remaining = remaining;
    this.resetAt = resetAt;
  }

  apply(snapshot: RateLimitSnapshot): void {
    this.limit = snapshot.limit;
    this.remaining = snapshot.remaining;
    this.resetAt = snapshot.resetAt;
  }

  blockFor(ms: number, now = Date.now()): void {
    this.blockedUntil = Math.max(this.blockedUntil, now + ms);
    this.remaining = 0;
  }

  /** Milliseconds to wait before the next request may proceed (0 = ready). */
  waitMs(now = Date.now()): number {
    if (this.remaining > 0 && now >= this.blockedUntil) return 0;
    const waits = [this.blockedUntil - now, this.resetAt - now].filter((w) => w > 0);
    return waits.length > 0 ? Math.max(...waits) : 0;
  }
}

/** In-memory bucket registry (single REST worker / client). */
export class RateLimitStore {
  private readonly buckets = new Map<string, RateLimitBucket>();

  getOrCreate(id: string): RateLimitBucket {
    let bucket = this.buckets.get(id);
    if (!bucket) {
      bucket = new RateLimitBucket(id);
      this.buckets.set(id, bucket);
    }
    return bucket;
  }

  update(snapshot: RateLimitSnapshot): RateLimitBucket {
    const bucket = this.getOrCreate(snapshot.bucketId);
    bucket.apply(snapshot);
    return bucket;
  }

  block(bucketId: string, retryAfterMs: number, now = Date.now()): RateLimitBucket {
    const bucket = this.getOrCreate(bucketId);
    bucket.blockFor(retryAfterMs, now);
    return bucket;
  }

  waitMs(bucketId: string, now = Date.now()): number {
    return this.getOrCreate(bucketId).waitMs(now);
  }
}

/** Read rate-limit headers from a `fetch` `Headers` object. */
export function headersFromFetch(headers: Headers): RateLimitHeaders {
  return {
    bucket: headers.get("x-ratelimit-bucket"),
    limit: headers.get("x-ratelimit-limit"),
    remaining: headers.get("x-ratelimit-remaining"),
    reset: headers.get("x-ratelimit-reset"),
    resetAfter: headers.get("x-ratelimit-reset-after"),
    retryAfter: headers.get("retry-after"),
  };
}

/** Parse `retry-after` header (seconds) to milliseconds. */
export function retryAfterMs(headers: RateLimitHeaders): number {
  const raw = headers.retryAfter ?? headers.resetAfter;
  if (!raw) return 1000;
  const sec = Number(raw);
  return Number.isFinite(sec) ? sec * 1000 : 1000;
}
