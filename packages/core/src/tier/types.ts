/** Process role when {@link Tier} is `split` or `distributed`. */
export type WorkerRole = "monolith" | "gateway" | "rest";

/** Deployment mode — see [docs/TIER_SPLIT.md](../../../docs/TIER_SPLIT.md). */
export type Tier = "monolith" | "split" | "distributed";

export type RestMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

/** Transport-agnostic Discord REST call (route is the path after `/api/v10`). */
export interface RestRequest {
  readonly method: RestMethod;
  readonly route: string;
  readonly body?: unknown;
  readonly query?: Readonly<Record<string, string>>;
}

export interface RestResponse<T = unknown> {
  readonly ok: true;
  readonly data: T;
}

export interface RestErrorResponse {
  readonly ok: false;
  readonly error: string;
}

export type RestResult<T = unknown> = RestResponse<T> | RestErrorResponse;

/** Outbound REST facade used by gateway workers. */
export interface RestPort {
  request<T = unknown>(req: RestRequest): Promise<T>;
}

/** Cross-worker event envelope (gateway ↔ rest, future: multi-gateway). */
export interface TierEvent {
  readonly type: string;
  readonly payload: unknown;
  readonly timestamp: number;
}

export interface TierBus {
  publish(event: TierEvent): void;
  subscribe(type: string, handler: (event: TierEvent) => void): () => void;
}
