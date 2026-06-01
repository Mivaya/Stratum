export type ShardStatus = "disconnected" | "identifying" | "resuming" | "ready";

export interface ShardSession {
  readonly sessionId: string;
  readonly sequence: number;
}

export interface ShardRecord {
  readonly id: number;
  status: ShardStatus;
  sessionId: string | null;
  sequence: number;
  lastConnectedAt: number | null;
}

export interface ShardManagerOptions {
  totalShards: number;
}

/** Tracks identify / resume state per shard (wire protocol in {@link buildIdentifyPayload}). */
export class ShardManager {
  readonly totalShards: number;
  private readonly shards = new Map<number, ShardRecord>();

  constructor(options: ShardManagerOptions) {
    this.totalShards = options.totalShards;
    for (let i = 0; i < options.totalShards; i++) {
      this.shards.set(i, {
        id: i,
        status: "disconnected",
        sessionId: null,
        sequence: 0,
        lastConnectedAt: null,
      });
    }
  }

  get(shardId: number): ShardRecord | undefined {
    return this.shards.get(shardId);
  }

  all(): readonly ShardRecord[] {
    return [...this.shards.values()];
  }

  markIdentifying(shardId: number): void {
    const shard = this.require(shardId);
    shard.status = "identifying";
  }

  markResuming(shardId: number): void {
    const shard = this.require(shardId);
    shard.status = "resuming";
  }

  markReady(shardId: number, session: ShardSession): void {
    const shard = this.require(shardId);
    shard.status = "ready";
    shard.sessionId = session.sessionId;
    shard.sequence = session.sequence;
    shard.lastConnectedAt = Date.now();
  }

  markDisconnected(shardId: number): void {
    const shard = this.require(shardId);
    shard.status = "disconnected";
  }

  updateSequence(shardId: number, sequence: number): void {
    this.require(shardId).sequence = sequence;
  }

  canResume(shardId: number): boolean {
    const shard = this.shards.get(shardId);
    return Boolean(shard?.sessionId);
  }

  private require(shardId: number): ShardRecord {
    const shard = this.shards.get(shardId);
    if (!shard) throw new Error(`Unknown shard id: ${shardId}`);
    return shard;
  }
}

export function createShardManager(options: ShardManagerOptions): ShardManager {
  return new ShardManager(options);
}
