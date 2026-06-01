/** Gateway ↔ bot worker message envelope. */
export interface WorkerMessage<T = unknown> {
  readonly type: string;
  readonly payload: T;
  readonly timestamp: number;
  readonly shardId?: number;
}

export type WorkerMessageHandler = (message: WorkerMessage) => void | Promise<void>;

/** Pub/sub between gateway and bot worker processes. */
export interface WorkerBus {
  publish(message: WorkerMessage): void | Promise<void>;
  subscribe(type: string, handler: WorkerMessageHandler): () => void;
}

export const WorkerMessageTypes = {
  gatewayReady: "gateway:ready",
  gatewayEvent: "gateway:event",
  botPing: "bot:ping",
} as const;

export function createWorkerMessage<T>(
  type: string,
  payload: T,
  shardId?: number,
): WorkerMessage<T> {
  if (shardId === undefined) {
    return { type, payload, timestamp: Date.now() };
  }
  return { type, payload, timestamp: Date.now(), shardId };
}
