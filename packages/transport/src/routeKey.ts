const SNOWFLAKE = /^\d{17,20}$/;

/** HTTP verb for route bucketing (matches {@link RestMethod} in core). */
export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

/** Normalized route + method pair (Discord major-parameter rules). */
export interface RouteKey {
  readonly method: HttpMethod;
  /** Route with snowflakes replaced by `:id` (leading slash). */
  readonly route: string;
}

/**
 * Normalize a Discord REST route for rate-limit grouping.
 * Replaces snowflake path segments with `:id` (Discord major parameters).
 */
export function normalizeRoute(route: string): string {
  const path = route.startsWith("/") ? route : `/${route}`;
  const segments = path.split("/").map((segment) => (SNOWFLAKE.test(segment) ? ":id" : segment));
  return segments.join("/") || "/";
}

/** Build a {@link RouteKey} from a raw route and HTTP method. */
export function parseRouteKey(route: string, method: HttpMethod): RouteKey {
  return Object.freeze({
    method,
    route: normalizeRoute(route),
  });
}

/** Stable bucket lookup key when Discord does not send `x-ratelimit-bucket`. */
export function fallbackBucketId(key: RouteKey): string {
  return `${key.method}:${key.route}`;
}
