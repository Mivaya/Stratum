import type { Blueprint } from "./blueprint/Blueprint.js";
import type { FieldSchema } from "./blueprint/field.js";
import { VaultRecord } from "./Record.js";
import type { Vault } from "./Vault.js";

export interface LedgerOptions<T extends Record<string, FieldSchema>> {
  blueprint: Blueprint<T>;
}

export class Ledger<T extends Record<string, FieldSchema> = Record<string, FieldSchema>> {
  readonly blueprint: Blueprint<T>;
  readonly cache = new Map<string, VaultRecord>();

  constructor(
    readonly vault: Vault,
    readonly name: string,
    options: LedgerOptions<T>,
  ) {
    this.blueprint = options.blueprint;
  }

  acquire(holder: { id: string } | string, id?: string): VaultRecord {
    const recordId = typeof holder === "string" ? holder : (id ?? holder.id);
    const target = typeof holder === "string" ? null : holder;

    const cached = this.cache.get(recordId);
    if (cached) return cached;

    const record = new VaultRecord(this, recordId, target);
    this.cache.set(recordId, record);
    return record;
  }

  get(id: string): VaultRecord | null {
    return this.cache.get(id) ?? null;
  }

  async init(): Promise<void> {
    await this.vault.driver.ensureLedger(this.name);
  }
}
