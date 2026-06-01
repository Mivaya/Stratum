import type { RestPort, RestRequest } from "@stratum/core";
import { createSession, type SessionInfo } from "@stratum/transport";
import { RateLimitQueue, toHttpMethod } from "./RateLimitQueue.js";
import { parseRouteKey } from "@stratum/transport";

export interface RestClientOptions {
  token: string;
  applicationId?: string;
  userId?: string;
  apiBaseUrl?: string;
  fetchImpl?: typeof fetch;
  queue?: RateLimitQueue;
}

export interface DiscordApiErrorBody {
  message?: string;
  code?: number;
}

/** Native Discord REST client (no discord.js / Discordeno). */
export class RestClient implements RestPort {
  readonly session: SessionInfo;
  readonly queue: RateLimitQueue;
  private readonly fetchImpl: typeof fetch;

  constructor(options: RestClientOptions) {
    this.session = createSession({
      token: options.token,
      ...(options.applicationId !== undefined ? { applicationId: options.applicationId } : {}),
      ...(options.userId !== undefined ? { userId: options.userId } : {}),
      ...(options.apiBaseUrl !== undefined ? { apiBaseUrl: options.apiBaseUrl } : {}),
    });
    this.queue = options.queue ?? new RateLimitQueue();
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async request<T = unknown>(req: RestRequest): Promise<T> {
    const routeKey = parseRouteKey(req.route, toHttpMethod(req.method));
    const response = await this.queue.run(routeKey, () => this.fetch(req));

    const text = await response.text();
    const body = text.length > 0 ? (JSON.parse(text) as unknown) : undefined;

    if (!response.ok) {
      const err = body as DiscordApiErrorBody | undefined;
      const message = err?.message ?? response.statusText ?? "Discord REST error";
      throw new Error(`Discord REST ${response.status}: ${message}`);
    }

    return body as T;
  }

  private fetch(req: RestRequest): Promise<Response> {
    const path = req.route.startsWith("/") ? req.route : `/${req.route}`;
    const url = new URL(`${this.session.apiBaseUrl}${path}`);
    if (req.query) {
      for (const [key, value] of Object.entries(req.query)) {
        url.searchParams.set(key, value);
      }
    }

    const headers: Record<string, string> = {
      Authorization: `Bot ${this.session.token}`,
      "User-Agent": "StratumBot (https://github.com/Interittus13/Stratum, 1.0)",
    };

    let body: string | undefined;
    if (req.body !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(req.body);
    }

    const init: RequestInit = { method: req.method, headers };
    if (body !== undefined) init.body = body;
    return this.fetchImpl(url, init);
  }
}

/** {@link RestPort} backed by {@link RestClient}. */
export class NativeRestPort implements RestPort {
  constructor(private readonly client: RestClient) {}

  request<T = unknown>(req: RestRequest): Promise<T> {
    return this.client.request<T>(req);
  }
}

export function createRestClient(options: RestClientOptions): RestClient {
  return new RestClient(options);
}

export function createNativeRestPort(token: string, options: Omit<RestClientOptions, "token"> = {}): NativeRestPort {
  return new NativeRestPort(createRestClient({ token, ...options }));
}
