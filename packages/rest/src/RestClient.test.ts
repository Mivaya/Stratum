import { describe, expect, it, vi } from "vitest";
import { RestClient } from "./RestClient.js";
import { RateLimitQueue } from "./RateLimitQueue.js";

function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

describe("@stratum/rest", () => {
  it("sends authorized GET and returns JSON", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(200, { ok: true }));

    const client = new RestClient({ token: "secret", fetchImpl });
    const data = await client.request<{ ok: boolean }>({ method: "GET", route: "/users/@me" });

    expect(data).toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledOnce();
    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>).Authorization).toBe("Bot secret");
  });

  it("retries after 429 using retry-after", async () => {
    vi.useFakeTimers();
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(429, { message: "rate limited" }, { "retry-after": "1", "x-ratelimit-limit": "1", "x-ratelimit-remaining": "0" }),
      )
      .mockResolvedValueOnce(
        jsonResponse(200, { ok: true }, { "x-ratelimit-limit": "5", "x-ratelimit-remaining": "4", "x-ratelimit-reset-after": "1" }),
      );

    const queue = new RateLimitQueue({ sleep: (ms) => new Promise((r) => setTimeout(r, ms)) });
    const client = new RestClient({ token: "t", fetchImpl, queue });

    const promise = client.request({ method: "GET", route: "/gateway/bot" });
    await vi.advanceTimersByTimeAsync(1000);
    const data = await promise;

    expect(data).toEqual({ ok: true });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("throws on Discord error body", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(403, { message: "Missing Access" }));
    const client = new RestClient({ token: "t", fetchImpl });

    await expect(client.request({ method: "GET", route: "/channels/1" })).rejects.toThrow(
      "Discord REST 403: Missing Access",
    );
  });
});
