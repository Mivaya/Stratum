export interface CooldownConsumeResult {
  allowed: boolean;
  /** Milliseconds until the user may invoke again (when denied). */
  retryAfterMs: number;
}

/** Pluggable cooldown storage (defaults to in-memory). */
export interface CooldownStore {
  consume(key: string, limit: number, windowMs: number, now?: number): CooldownConsumeResult;
  reset?(key: string): void;
  clear?(): void;
}

/** Sliding-window cooldown store (single process). */
export class MemoryCooldownStore implements CooldownStore {
  private readonly hits = new Map<string, number[]>();

  consume(key: string, limit: number, windowMs: number, now = Date.now()): CooldownConsumeResult {
    const windowStart = now - windowMs;
    const timestamps = (this.hits.get(key) ?? []).filter((t) => t > windowStart);

    if (timestamps.length >= limit) {
      const oldest = timestamps[0]!;
      return { allowed: false, retryAfterMs: Math.max(0, oldest + windowMs - now) };
    }

    timestamps.push(now);
    this.hits.set(key, timestamps);
    return { allowed: true, retryAfterMs: 0 };
  }

  reset(key: string): void {
    this.hits.delete(key);
  }

  clear(): void {
    this.hits.clear();
  }
}

export const defaultCooldownStore = new MemoryCooldownStore();
