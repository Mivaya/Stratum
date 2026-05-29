export type SaveHandler = (ledger: string, id: string, data: Record<string, unknown>) => Promise<void>;

/** Debounces writes per record id (Klasa RequestHandler-inspired). */
export class SyncBatcher {
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly pending = new Map<string, Record<string, unknown>>();

  constructor(
    readonly debounceMs: number,
    readonly onSave: SaveHandler,
  ) {}

  queue(ledger: string, id: string, data: Record<string, unknown>): void {
    const key = `${ledger}:${id}`;
    this.pending.set(key, structuredClone(data));

    const existing = this.timers.get(key);
    if (existing) clearTimeout(existing);

    this.timers.set(
      key,
      setTimeout(() => {
        void this.flushKey(key);
      }, this.debounceMs),
    );
  }

  async flush(): Promise<void> {
    const keys = [...this.timers.keys()];
    for (const key of keys) {
      await this.flushKey(key);
    }
  }

  private async flushKey(key: string): Promise<void> {
    const timer = this.timers.get(key);
    if (timer) clearTimeout(timer);
    this.timers.delete(key);

    const data = this.pending.get(key);
    if (!data) return;
    this.pending.delete(key);

    const [ledger, id] = key.split(":");
    if (!ledger || !id) return;
    await this.onSave(ledger, id, data);
  }
}
