export interface IdentifyBudgetOptions {
  /** Minimum ms between identify starts (Discord ~5s per token). */
  minIntervalMs?: number;
  /** Max concurrent identifies in flight. */
  maxConcurrent?: number;
  now?: () => number;
  sleep?: (ms: number) => Promise<void>;
}

/**
 * Rate-limits gateway identify calls to stay within Discord's identify budget.
 */
export class IdentifyBudget {
  private readonly minIntervalMs: number;
  private readonly maxConcurrent: number;
  private readonly now: () => number;
  private readonly sleep: (ms: number) => Promise<void>;

  private lastIdentifyAt: number | null = null;
  private inFlight = 0;
  private readonly waitQueue: Array<() => void> = [];

  constructor(options?: IdentifyBudgetOptions) {
    this.minIntervalMs = options?.minIntervalMs ?? 5500;
    this.maxConcurrent = options?.maxConcurrent ?? 1;
    this.now = options?.now ?? Date.now;
    this.sleep = options?.sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
  }

  /** Wait until an identify slot is available, then reserve it. */
  async acquire(): Promise<void> {
    while (this.inFlight >= this.maxConcurrent) {
      await new Promise<void>((resolve) => this.waitQueue.push(resolve));
    }

    if (this.lastIdentifyAt !== null) {
      const elapsed = this.now() - this.lastIdentifyAt;
      if (elapsed < this.minIntervalMs) {
        await this.sleep(this.minIntervalMs - elapsed);
      }
    }

    this.inFlight++;
    this.lastIdentifyAt = this.now();
  }

  /** Release a slot after identify completes or fails. */
  release(): void {
    this.inFlight = Math.max(0, this.inFlight - 1);
    const next = this.waitQueue.shift();
    next?.();
  }

  /** Earliest timestamp (ms) the next identify may start without waiting. */
  nextAllowedAt(): number {
    if (this.lastIdentifyAt === null) return this.now();
    return this.lastIdentifyAt + this.minIntervalMs;
  }

  inFlightCount(): number {
    return this.inFlight;
  }

  queuedCount(): number {
    return this.waitQueue.length;
  }
}

export function createIdentifyBudget(options?: IdentifyBudgetOptions): IdentifyBudget {
  return new IdentifyBudget(options);
}
