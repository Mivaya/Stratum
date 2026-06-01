import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { RestPort, RestRequest, RestResult } from "./types.js";

export interface RestWorkerServerOptions {
  port: number;
  host?: string;
  portImpl: RestPort;
  /** When set, requests must include `Authorization: Bearer <secret>`. */
  secret?: string;
}

export interface RestWorkerServerHandle {
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

export function createRestWorkerServer(options: RestWorkerServerOptions): Promise<RestWorkerServerHandle> {
  const host = options.host ?? "127.0.0.1";

  const server: Server = createServer(async (req, res) => {
    if (req.method === "GET" && req.url === "/health") {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method !== "POST" || req.url !== "/v1/rest") {
      sendJson(res, 404, { ok: false, error: "Not found" });
      return;
    }

    if (!authorize(req, options.secret)) {
      sendJson(res, 401, { ok: false, error: "Unauthorized" });
      return;
    }

    try {
      const raw = await readBody(req);
      const restReq = JSON.parse(raw) as RestRequest;
      const data = await options.portImpl.request(restReq);
      sendJson(res, 200, { ok: true, data } satisfies RestResult);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      sendJson(res, 500, { ok: false, error: message } satisfies RestResult);
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
