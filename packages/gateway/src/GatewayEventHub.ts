import type { Bridge, BridgeEventHandler } from "@stambha/core";

export interface GatewayEventHubReadyPayload {
  user?: { id: string; username?: string };
}

/**
 * Native gateway event hub — implements {@link Bridge} without discord.js or Discordeno.
 * Your WebSocket shard worker calls {@link emit} with Discord payloads normalized to Stambha shapes.
 */
export class GatewayEventHub implements Bridge {
  readonly id = "native";

  private readonly handlers = new Map<string, Set<BridgeEventHandler>>();
  private readyPayload: GatewayEventHubReadyPayload | null = null;

  async connect(): Promise<void> {
    if (this.readyPayload) {
      queueMicrotask(() => this.emit("ready", this.readyPayload));
    }
  }

  async disconnect(): Promise<void> {
    this.handlers.clear();
  }

  /** Call before {@link connect} when the gateway session is ready. */
  markReady(payload: GatewayEventHubReadyPayload): void {
    this.readyPayload = payload;
  }

  on(event: string, handler: BridgeEventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  off(event: string, handler: BridgeEventHandler): void {
    this.handlers.get(event)?.delete(handler);
  }

  once(event: string, handler: BridgeEventHandler): void {
    const wrapper: BridgeEventHandler = (payload) => {
      this.off(event, wrapper);
      handler(payload);
    };
    this.on(event, wrapper);
  }

  emit(event: string, payload: unknown): void {
    const set = this.handlers.get(event);
    if (!set) return;
    for (const handler of set) {
      void handler(payload);
    }
  }
}

export function createGatewayEventHub(): GatewayEventHub {
  return new GatewayEventHub();
}
