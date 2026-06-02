import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import type { ReshardController } from "./ReshardController.js";

export interface ReshardServerOptions {
  port: number;
  host?: string;
  controller: ReshardController;
  secret?: string;
}

export interface ReshardServerHandle {
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
  return req.headers.authorization === `Bearer ${secret}`;
}

/**
 * HTTP operator API for manual resharding (evaluate, plan, start, status).
 */
export function createReshardServer(options: ReshardServerOptions): Promise<ReshardServerHandle> {
  const host = options.host ?? "127.0.0.1";
  const controller = options.controller;

  const server: Server = createServer(async (req, res) => {
    if (req.method === "GET" && req.url === "/health") {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (!authorize(req, options.secret)) {
      sendJson(res, 401, { ok: false, error: "Unauthorized" });
      return;
    }

    try {
      if (req.method === "GET" && req.url === "/v1/reshard/status") {
        sendJson(res, 200, {
          ok: true,
          status: controller.status,
          plan: controller.plan,
        });
        return;
      }

      if (req.method === "POST" && req.url === "/v1/reshard/evaluate") {
        const raw = await readBody(req);
        const body = JSON.parse(raw || "{}") as { guildCount?: number };
        if (typeof body.guildCount !== "number") {
          sendJson(res, 400, { ok: false, error: "guildCount required" });
          return;
        }
        sendJson(res, 200, { ok: true, evaluation: controller.evaluate(body.guildCount) });
        return;
      }

      if (req.method === "POST" && req.url === "/v1/reshard/plan") {
        const raw = await readBody(req);
        const body = JSON.parse(raw || "{}") as { targetShards?: number };
        if (typeof body.targetShards !== "number") {
          sendJson(res, 400, { ok: false, error: "targetShards required" });
          return;
        }
        const plan = controller.planManual(body.targetShards);
        sendJson(res, 200, { ok: true, plan });
        return;
      }

      if (req.method === "POST" && req.url === "/v1/reshard/start") {
        const raw = await readBody(req);
        const body = JSON.parse(raw || "{}") as { targetShards?: number };
        let plan = controller.plan;
        if (typeof body.targetShards === "number") {
          plan = controller.planManual(body.targetShards);
        }
        if (!plan && typeof body.targetShards !== "number") {
          sendJson(res, 400, { ok: false, error: "targetShards required when no plan exists" });
          return;
        }
        const started = controller.start(plan ?? undefined);
        sendJson(res, 200, { ok: true, plan: started, status: controller.status });
        return;
      }

      if (req.method === "POST" && req.url === "/v1/reshard/complete") {
        controller.complete();
        sendJson(res, 200, {
          ok: true,
          status: controller.status,
          totalShards: controller.totalShards,
        });
        return;
      }

      sendJson(res, 404, { ok: false, error: "Not found" });
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
      resolve({
        url: `http://${host}:${actualPort}`,
        close: () =>
          new Promise<void>((closeResolve, closeReject) => {
            server.close((err) => (err ? closeReject(err) : closeResolve()));
          }),
      });
    });
  });
}
