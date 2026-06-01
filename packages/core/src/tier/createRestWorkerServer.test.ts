import { describe, expect, it } from "vitest";
import { createRestWorkerServer } from "./createRestWorkerServer.js";
import { HttpRestPort } from "./HttpRestPort.js";
import type { RestPort, RestRequest } from "./types.js";

class EchoRestPort implements RestPort {
  async request<T>(req: RestRequest): Promise<T> {
    return { route: req.route, method: req.method } as T;
  }
}

describe("createRestWorkerServer", () => {
  it("proxies REST requests via HttpRestPort", async () => {
    const server = await createRestWorkerServer({
      port: 0,
      portImpl: new EchoRestPort(),
    });

    const port = Number(new URL(server.url).port);
    const client = new HttpRestPort({ baseUrl: `http://127.0.0.1:${port}` });

    const data = await client.request<{ route: string }>({
      method: "POST",
      route: "/channels/1/messages",
      body: { content: "hi" },
    });

    expect(data.route).toBe("/channels/1/messages");

    const health = await fetch(`${server.url}/health`);
    expect(health.ok).toBe(true);

    await server.close();
  });
});
