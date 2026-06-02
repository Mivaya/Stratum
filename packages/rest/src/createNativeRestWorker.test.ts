import { describe, expect, it, vi } from "vitest";
import { createNativeRestWorker } from "./createNativeRestWorker.js";

function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

describe("createNativeRestWorker", () => {
  it("serves /health and /v1/rest with bearer auth", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse(200, { id: "1" }, { "x-ratelimit-limit": "5", "x-ratelimit-remaining": "4", "x-ratelimit-reset-after": "1" }),
    );

    const worker = await createNativeRestWorker({
      token: "secret",
      port: 0,
      secret: "worker-key",
      fetchImpl,
    });

    const health = await fetch(`${worker.url}/health`);
    expect(await health.json()).toEqual({ ok: true });

    const unauthorized = await fetch(`${worker.url}/v1/rest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: "GET", route: "/users/@me" }),
    });
    expect(unauthorized.status).toBe(401);

    const res = await fetch(`${worker.url}/v1/rest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer worker-key",
      },
      body: JSON.stringify({ method: "GET", route: "/users/@me" }),
    });
    const json = (await res.json()) as { ok: boolean; data: { id: string } };
    expect(json.ok).toBe(true);
    expect(json.data.id).toBe("1");

    await worker.close();
  });
});
