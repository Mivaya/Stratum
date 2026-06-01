import type { RestPort, RestRequest, RestResult } from "./types.js";

export interface HttpRestPortOptions {
  /** Base URL of the REST worker, e.g. `http://127.0.0.1:4000` */
  baseUrl: string;
  /** Optional bearer token shared with the REST worker. */
  secret?: string;
  fetchImpl?: typeof fetch;
}

/** Gateway-side client that forwards REST calls to a remote REST worker. */
export class HttpRestPort implements RestPort {
  private readonly baseUrl: string;
  private readonly secret: string | undefined;
  private readonly fetchImpl: typeof fetch;

  constructor(options: HttpRestPortOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.secret = options.secret;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async request<T = unknown>(req: RestRequest): Promise<T> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.secret) headers.Authorization = `Bearer ${this.secret}`;

    const res = await this.fetchImpl(`${this.baseUrl}/v1/rest`, {
      method: "POST",
      headers,
      body: JSON.stringify(req),
    });

    const json = (await res.json()) as RestResult<T>;
    if (!json.ok) {
      throw new Error(json.error);
    }
    return json.data;
  }
}
