import type { WorkerBus, WorkerMessage, WorkerMessageHandler } from "./types.js";

/** In-process worker bus for tests and single-machine tier split v2. */
export class InMemoryWorkerBus implements WorkerBus {
  private readonly handlers = new Map<string, Set<WorkerMessageHandler>>();

  publish(message: WorkerMessage): void {
    const set = this.handlers.get(message.type);
    if (!set) return;
    for (const handler of set) {
      void handler(message);
    }
    const wildcard = this.handlers.get("*");
    if (wildcard) {
      for (const handler of wildcard) {
        void handler(message);
      }
    }
  }

  subscribe(type: string, handler: WorkerMessageHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
    return () => this.handlers.get(type)?.delete(handler);
  }
}
