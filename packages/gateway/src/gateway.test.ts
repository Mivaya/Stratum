import { describe, expect, it, vi } from "vitest";
import { guildShardId, recommendedShardCount, shardIdsForWorker } from "./shard/calculator.js";
import { createShardManager } from "./shard/ShardManager.js";
import { buildIdentifyPayload, buildResumePayload, combineIntents, GatewayIntent } from "./shard/identify.js";
import { createSession } from "@stambha/transport";
import { InMemoryWorkerBus } from "./worker/InMemoryWorkerBus.js";
import { createWorkerMessage, WorkerMessageTypes } from "./worker/types.js";
import { attachGatewayRelay } from "./worker/gatewayRelay.js";
import { createWorkerServer } from "./worker/HttpWorkerBus.js";
import type { Bridge } from "@stambha/core";

describe("@stambha/gateway", () => {
  it("calculates shard ids", () => {
    expect(recommendedShardCount(2500)).toBe(3);
    expect(guildShardId("123456789012345678", 4)).toBeGreaterThanOrEqual(0);
    expect(shardIdsForWorker(4, 0, 2)).toEqual([0, 2]);
  });

  it("manages shard lifecycle", () => {
    const manager = createShardManager({ totalShards: 2 });
    manager.markIdentifying(0);
    manager.markReady(0, { sessionId: "abc", sequence: 1 });
    expect(manager.get(0)?.status).toBe("ready");
    expect(manager.canResume(0)).toBe(true);
    manager.markDisconnected(0);
    expect(manager.get(0)?.status).toBe("disconnected");
  });

  it("builds identify and resume payloads", () => {
    const session = createSession({ token: "t" });
    const identify = buildIdentifyPayload({
      session,
      shardId: 0,
      totalShards: 2,
      intents: combineIntents(GatewayIntent.Guilds, GatewayIntent.GuildMessages),
    });
    expect(identify.op).toBe(2);
    expect(identify.d.shard).toEqual([0, 2]);

    const resume = buildResumePayload(session, "sess", 5);
    expect(resume.op).toBe(6);
    expect(resume.d.seq).toBe(5);
  });

  it("relays bridge events over in-memory bus", async () => {
    const bus = new InMemoryWorkerBus();
    const events: string[] = [];
    bus.subscribe(WorkerMessageTypes.gatewayEvent, (m) => {
      events.push((m.payload as { event: string }).event);
    });

    const bridge: Bridge = {
      id: "mock",
      on(event, handler) {
        (this as { _h?: Record<string, unknown> })._h ??= {};
        (this as { _h: Record<string, unknown> })._h[event] = handler;
      },
      off() {},
      once(event, handler) {
        this.on(event, handler);
      },
      emit(event, payload) {
        const h = (this as { _h?: Record<string, (p: unknown) => void> })._h?.[event];
        h?.(payload);
      },
      connect: async () => {},
      disconnect: async () => {},
    };

    attachGatewayRelay(bridge, { bus, events: ["messageCreate"] });
    bridge.emit("messageCreate", { content: "!" });
    expect(events).toEqual(["messageCreate"]);
  });

  it("serves worker HTTP ingress", async () => {
    const received: string[] = [];
    const server = await createWorkerServer({
      port: 0,
      onMessage: async (m) => {
        received.push(m.type);
      },
    });

    await fetch(`${server.url}/v1/worker`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createWorkerMessage("test", {})),
    });

    expect(received).toEqual(["test"]);
    await server.close();
  });
});
