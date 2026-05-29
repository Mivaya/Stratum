import { EventEmitter } from "node:events";
import type { FieldSchema } from "./blueprint/field.js";
import { MemoryDriver } from "./driver/MemoryDriver.js";
import type { VaultDriver } from "./driver/types.js";
import { Ledger, type LedgerOptions } from "./Ledger.js";
import type { VaultRecord } from "./Record.js";
import { SyncBatcher } from "./sync/SyncBatcher.js";

export interface VaultOptions {
  driver?: VaultDriver;
  debounceMs?: number;
}

export type VaultEvents = {
  recordSync: [{ ledger: string; id: string; record: VaultRecord }];
  recordSave: [{ ledger: string; id: string; record: VaultRecord }];
  recordDelete: [{ ledger: string; id: string }];
};

export class Vault extends EventEmitter {
  readonly driver: VaultDriver;
  readonly batcher: SyncBatcher;
  private readonly ledgers = new Map<string, Ledger>();

  constructor(options: VaultOptions = {}) {
    super();
    this.driver = options.driver ?? new MemoryDriver();
    this.batcher = new SyncBatcher(options.debounceMs ?? 400, (ledger, id, data) =>
      this.driver.set(ledger, id, data),
    );
  }

  registerLedger<T extends Record<string, FieldSchema>>(
    name: string,
    options: LedgerOptions<T>,
  ): Ledger<T> {
    if (this.ledgers.has(name)) {
      throw new Error(`Ledger "${name}" is already registered.`);
    }
    const ledger = new Ledger(this, name, options);
    this.ledgers.set(name, ledger as Ledger);
    return ledger;
  }

  ledger<T extends Record<string, FieldSchema> = Record<string, FieldSchema>>(
    name: string,
  ): Ledger<T> {
    const ledger = this.ledgers.get(name);
    if (!ledger) throw new Error(`Ledger "${name}" is not registered.`);
    return ledger as Ledger<T>;
  }

  async init(): Promise<void> {
    await Promise.all([...this.ledgers.values()].map((l) => l.init()));
  }

  async flush(): Promise<void> {
    await this.batcher.flush();
  }

  override emit<K extends keyof VaultEvents>(event: K, ...args: VaultEvents[K]): boolean {
    return super.emit(event, ...args);
  }

  override on<K extends keyof VaultEvents>(
    event: K,
    listener: (...args: VaultEvents[K]) => void,
  ): this {
    return super.on(event, listener);
  }
}
