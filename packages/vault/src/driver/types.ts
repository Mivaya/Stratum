export interface VaultDriver {
  ensureLedger(ledger: string): Promise<void>;
  get(ledger: string, id: string): Promise<Record<string, unknown> | null>;
  getMany(ledger: string, ids: string[]): Promise<Map<string, Record<string, unknown>>>;
  set(ledger: string, id: string, data: Record<string, unknown>): Promise<void>;
  delete(ledger: string, id: string): Promise<void>;
}
