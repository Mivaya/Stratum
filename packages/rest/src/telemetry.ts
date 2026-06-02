/** Optional hooks for REST queue telemetry (wired by `@stratum/metrics`). */
export interface RestTelemetry {
  recordRequest(event: {
    method: string;
    route: string;
    status: number;
    durationMs: number;
  }): void;
  recordRateLimit(bucketId: string): void;
  recordWait(bucketId: string, waitMs: number): void;
}

export interface RateLimitQueueListener {
  onWait?(bucketId: string, waitMs: number): void;
  onRateLimited?(bucketId: string, waitMs: number): void;
}

/** Build queue listener from {@link RestTelemetry}. */
export function createRestTelemetryListener(telemetry: RestTelemetry): RateLimitQueueListener {
  return {
    onWait: (bucketId, waitMs) => telemetry.recordWait(bucketId, waitMs),
    onRateLimited: (bucketId) => telemetry.recordRateLimit(bucketId),
  };
}
