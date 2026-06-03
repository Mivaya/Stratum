import type { Bridge } from "@stambha/core";
import type { WorkerMessage } from "./types.js";
import { WorkerMessageTypes, createWorkerMessage } from "./types.js";

/** Minimal publish-only surface for HTTP or in-memory relay. */
export interface WorkerPublisher {
  publish(message: WorkerMessage): void | Promise<void>;
}

const DEFAULT_EVENTS = [
  "messageCreate",
  "messageUpdate",
  "interactionCreate",
  "ready",
  "guildCreate",
  "guildDelete",
] as const;

export interface GatewayRelayOptions {
  bus: WorkerPublisher;
  /** Discord gateway events to forward (default: core routing events). */
  events?: readonly string[];
  shardId?: number;
}

/**
 * Forward bridge gateway events to a bot worker via {@link WorkerBus}.
 * Used in tier split v2 — gateway process holds the bridge; bot process runs StambhaClient.
 */
export function attachGatewayRelay(bridge: Bridge, options: GatewayRelayOptions): () => void {
  const events = options.events ?? DEFAULT_EVENTS;
  const unsubs: (() => void)[] = [];

  for (const event of events) {
    const handler = (payload: unknown) => {
      void options.bus.publish(
        createWorkerMessage(WorkerMessageTypes.gatewayEvent, { event, payload }, options.shardId),
      );
    };
    bridge.on(event, handler);
    unsubs.push(() => bridge.off(event, handler));
  }

  bridge.once("ready", (payload) => {
    void options.bus.publish(
      createWorkerMessage(WorkerMessageTypes.gatewayReady, payload, options.shardId),
    );
  });

  return () => {
    for (const off of unsubs) off();
  };
}
