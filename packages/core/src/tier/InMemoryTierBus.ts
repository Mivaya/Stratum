import type { TierBus, TierEvent } from "./types.js";

/** In-process bus for tests and single-machine split simulation. */
export class InMemoryTierBus implements TierBus {
  private readonly handlers = new Map<string, Set<(event: TierEvent) => void>>();

  publish(event: TierEvent): void {
    const typeHandlers = this.handlers.get(event.type);
    if (!typeHandlers) return;
    for (const handler of typeHandlers) {
      handler(event);
    }
  }

  subscribe(type: string, handler: (event: TierEvent) => void): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
    return () => this.handlers.get(type)?.delete(handler);
  }
}
