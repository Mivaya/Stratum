import type { HttpMethod } from "@stambha/transport";
import {
  fallbackBucketId,
  headersFromFetch,
  parseRateLimitHeaders,
  type RouteKey,
  RateLimitStore,
  retryAfterMs,
} from "@stambha/transport";

import type { RateLimitQueueListener } from "./telemetry.js";

export interface RateLimitQueueOptions {
  store?: RateLimitStore;
  /** Max automatic retries after HTTP 429. */
  maxRetries?: number;
  sleep?: (ms: number) => Promise<void>;
  listener?: RateLimitQueueListener;
}

const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Per-bucket request chains — serializes calls so rate limits stay centralized
 * (Discordeno `@discordeno/rest` pattern).
 */
export class RateLimitQueue {
  readonly store: RateLimitStore;
  private readonly maxRetries: number;
  private readonly sleep: (ms: number) => Promise<void>;
  private readonly listener: RateLimitQueueListener | undefined;
  private readonly chains = new Map<string, Promise<void>>();

  constructor(options: RateLimitQueueOptions = {}) {
    this.store = options.store ?? new RateLimitStore();
    this.maxRetries = options.maxRetries ?? 3;
    this.sleep = options.sleep ?? defaultSleep;
    this.listener = options.listener;
  }

  /** Run `fn` when the bucket for `routeKey` allows it; retries on 429. */
  async run(routeKey: RouteKey, fn: () => Promise<Response>): Promise<Response> {
    const bucketId = fallbackBucketId(routeKey);
    const previous = this.chains.get(bucketId) ?? Promise.resolve();
    const current = previous.then(() => this.executeWithLimits(routeKey, bucketId, fn));
    this.chains.set(
      bucketId,
      current.then(
        () => undefined,
        () => undefined,
      ),
    );
    return current;
  }

  private async executeWithLimits(
    routeKey: RouteKey,
    bucketId: string,
    fn: () => Promise<Response>,
  ): Promise<Response> {
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const wait = this.store.waitMs(bucketId);
      if (wait > 0) {
        this.listener?.onWait?.(bucketId, wait);
        await this.sleep(wait);
      }

      const response = await fn();
      const headers = headersFromFetch(response.headers);
      const snapshot = parseRateLimitHeaders(headers, routeKey);
      if (snapshot) this.store.update(snapshot);

      if (response.status !== 429) return response;

      const ms = retryAfterMs(headers);
      this.store.block(snapshot?.bucketId ?? bucketId, ms);
      this.listener?.onRateLimited?.(snapshot?.bucketId ?? bucketId, ms);
      if (attempt === this.maxRetries) return response;
    }

    throw new Error("RateLimitQueue: exhausted retries");
  }
}

/** Map core {@link RestMethod} to transport {@link HttpMethod}. */
export function toHttpMethod(method: string): HttpMethod {
  return method as HttpMethod;
}
