import type { VaultDriver } from "./types.js";

/** In-memory driver for tests and development. */
export class MemoryDriver implements VaultDriver {
  private readonly store = new Map<string, Map<string, Record<string, unknown>>>();

  async ensureLedger(ledger: string): Promise<void> {
    if (!this.store.has(ledger)) {
      this.store.set(ledger, new Map());
    }
  }

  async get(ledger: string, id: string): Promise<Record<string, unknown> | null> {
    return this.store.get(ledger)?.get(id) ?? null;
  }

  async getMany(ledger: string, ids: string[]): Promise<Map<string, Record<string, unknown>>> {
    const result = new Map<string, Record<string, unknown>>();
    const table = this.store.get(ledger);
    if (!table) return result;
    for (const id of ids) {
      const row = table.get(id);
      if (row) result.set(id, structuredClone(row));
    }
    return result;
  }

  async set(ledger: string, id: string, data: Record<string, unknown>): Promise<void> {
    await this.ensureLedger(ledger);
    this.store.get(ledger)!.set(id, structuredClone(data));
  }

  async delete(ledger: string, id: string): Promise<void> {
    this.store.get(ledger)?.delete(id);
  }
}
