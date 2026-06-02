import { describe, expect, it, vi } from "vitest";
import { parseRateLimitHeaders, RateLimitBucket, RateLimitStore, retryAfterMs } from "./rateLimit.js";
import { parseRouteKey } from "./routeKey.js";

describe("rateLimit", () => {
  it("parses Discord rate-limit headers", () => {
    const key = parseRouteKey("/channels/1/messages", "GET");
    const snapshot = parseRateLimitHeaders(
      { bucket: "abc", limit: "5", remaining: "3", resetAfter: "1.5" },
      key,
      1_000,
    );
    expect(snapshot).toEqual({
      bucketId: "abc",
      limit: 5,
      remaining: 3,
      resetAt: 2_500,
    });
  });

  it("blocks and waits on bucket exhaustion", () => {
    vi.useFakeTimers();
    const store = new RateLimitStore();
    const bucket = store.block("abc", 500, 1_000);
    expect(bucket.waitMs(1_000)).toBe(500);
    vi.advanceTimersByTime(500);
    expect(bucket.waitMs(1_500)).toBe(0);
    vi.useRealTimers();
  });

  it("parses retry-after seconds", () => {
    expect(retryAfterMs({ retryAfter: "2.5" })).toBe(2500);
  });
});
