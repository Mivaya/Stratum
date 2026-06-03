import type { Bridge, BridgeEventHandler } from "./types.js";

/** In-memory bridge for tests and examples without Discord. */
export class MockBridge implements Bridge {
  readonly id = "mock";

  private readonly handlers = new Map<string, Set<BridgeEventHandler>>();
  connected = false;

  async connect(): Promise<void> {
    this.connected = true;
    queueMicrotask(() => this.emit("ready", { user: { id: "0", username: "stambha-bot" } }));
  }

  async disconnect(): Promise<void> {
    this.connected = false;
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
      handler(payload);
    }
  }

  /** Simulate an inbound message for scouts / prefix directives. */
  simulateMessage(payload: {
    content: string;
    author: { id: string; bot?: boolean };
    guildId?: string;
    channelId?: string;
  }): void {
    this.emit("message", payload);
  }
}
