import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { WorkerMessage } from "./types.js";

export interface HttpWorkerClientOptions {
  baseUrl: string;
  secret?: string;
  fetchImpl?: typeof fetch;
}

export interface WorkerServerOptions {
  port: number;
  host?: string;
  /** When set, requests must include `Authorization: Bearer <secret>`. */
  secret?: string;
  onMessage: (message: WorkerMessage) => void | Promise<void>;
}

export interface WorkerServerHandle {
  readonly url: string;
  close(): Promise<void>;
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function authorize(req: IncomingMessage, secret?: string): boolean {
  if (!secret) return true;
  const header = req.headers.authorization;
  return header === `Bearer ${secret}`;
}

/** HTTP client — publishes worker messages to a remote {@link createWorkerServer}. */
export class HttpWorkerClient {
  private readonly baseUrl: string;
  private readonly secret: string | undefined;
  private readonly fetchImpl: typeof fetch;

  constructor(options: HttpWorkerClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.secret = options.secret;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async publish(message: WorkerMessage): Promise<void> {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.secret) headers.Authorization = `Bearer ${this.secret}`;

    const res = await this.fetchImpl(`${this.baseUrl}/v1/worker`, {
      method: "POST",
      headers,
      body: JSON.stringify(message),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? `Worker HTTP ${res.status}`);
    }
  }
}

export function createHttpWorkerClient(options: HttpWorkerClientOptions): HttpWorkerClient {
  return new HttpWorkerClient(options);
}

export function createWorkerServer(options: WorkerServerOptions): Promise<WorkerServerHandle> {
  const host = options.host ?? "127.0.0.1";

  const server: Server = createServer(async (req, res) => {
    if (req.method === "GET" && req.url === "/health") {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method !== "POST" || req.url !== "/v1/worker") {
      sendJson(res, 404, { ok: false, error: "Not found" });
      return;
    }

    if (!authorize(req, options.secret)) {
      sendJson(res, 401, { ok: false, error: "Unauthorized" });
      return;
    }

    try {
      const raw = await readBody(req);
      const message = JSON.parse(raw) as WorkerMessage;
      await options.onMessage(message);
      sendJson(res, 200, { ok: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      sendJson(res, 500, { ok: false, error: message });
    }
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(options.port, host, () => {
      const addr = server.address();
      const actualPort =
        typeof addr === "object" && addr !== null ? addr.port : options.port;
      const url = `http://${host}:${actualPort}`;
      resolve({
        url,
        close: () =>
          new Promise<void>((closeResolve, closeReject) => {
            server.close((err) => (err ? closeReject(err) : closeResolve()));
          }),
      });
    });
  });
}
