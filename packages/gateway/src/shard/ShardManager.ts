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
  private _totalShards: number;
  private readonly shards = new Map<number, ShardRecord>();

  constructor(options: ShardManagerOptions) {
    this._totalShards = options.totalShards;
    this.initShards(0, options.totalShards);
  }

  get totalShards(): number {
    return this._totalShards;
  }

  private initShards(from: number, to: number): void {
    for (let i = from; i < to; i++) {
      this.shards.set(i, {
        id: i,
        status: "disconnected",
        sessionId: null,
        sequence: 0,
        lastConnectedAt: null,
      });
    }
  }

  /**
   * Grow or shrink tracked shards for resharding. Existing shard state is preserved
   * for ids that remain; new shards start disconnected.
   */
  resize(newTotalShards: number): void {
    if (newTotalShards < 1) throw new Error("totalShards must be >= 1");
    if (newTotalShards > this._totalShards) {
      this.initShards(this._totalShards, newTotalShards);
    } else if (newTotalShards < this._totalShards) {
      for (let i = newTotalShards; i < this._totalShards; i++) {
        this.shards.delete(i);
      }
    }
    this._totalShards = newTotalShards;
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
