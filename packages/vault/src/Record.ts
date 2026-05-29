import type { Ledger } from "./Ledger.js";

export enum RecordStatus {
  Unsynchronized = "unsynchronized",
  NotExists = "not_exists",
  Exists = "exists",
  Defaults = "defaults",
}

export class VaultRecord<T extends Record<string, unknown> = Record<string, unknown>> {
  private data: T;
  status: RecordStatus = RecordStatus.Unsynchronized;
  private dirty = false;

  constructor(
    readonly ledger: Ledger,
    readonly id: string,
    readonly holder: unknown,
  ) {
    this.data = ledger.blueprint.defaults() as T;
  }

  get<K extends keyof T>(key: K): T[K] {
    return this.data[key];
  }

  getAll(): Readonly<T> {
    return this.data;
  }

  set<K extends keyof T>(key: K, value: T[K]): this {
    const patch = { [key]: value } as Record<string, unknown>;
    this.data = this.ledger.blueprint.patch(this.data as Record<string, unknown>, patch) as T;
    this.dirty = true;
    this.ledger.vault.batcher.queue(this.ledger.name, this.id, this.data as Record<string, unknown>);
    return this;
  }

  patch(partial: Partial<T>): this {
    this.data = this.ledger.blueprint.patch(
      this.data as Record<string, unknown>,
      partial as Record<string, unknown>,
    ) as T;
    this.dirty = true;
    this.ledger.vault.batcher.queue(this.ledger.name, this.id, this.data as Record<string, unknown>);
    return this;
  }

  async sync(force = this.status === RecordStatus.Unsynchronized): Promise<this> {
    if (!force && this.status !== RecordStatus.Unsynchronized) {
      return this;
    }

    const row = await this.ledger.vault.driver.get(this.ledger.name, this.id);
    if (row) {
      this.data = this.ledger.blueprint.validate(row) as T;
      this.status = RecordStatus.Exists;
    } else {
      this.data = this.ledger.blueprint.defaults() as T;
      this.status = RecordStatus.NotExists;
    }

    this.dirty = false;
    this.ledger.vault.emit("recordSync", { ledger: this.ledger.name, id: this.id, record: this });
    return this;
  }

  async save(): Promise<this> {
    await this.ledger.vault.batcher.flush();
    const validated = this.ledger.blueprint.validate(this.data as Record<string, unknown>);
    await this.ledger.vault.driver.set(this.ledger.name, this.id, validated);
    this.data = validated as T;
    this.status = RecordStatus.Exists;
    this.dirty = false;
    this.ledger.vault.emit("recordSave", { ledger: this.ledger.name, id: this.id, record: this });
    return this;
  }

  async reset<K extends keyof T>(key?: K): Promise<this> {
    const defaults = this.ledger.blueprint.defaults() as T;
    if (key === undefined) {
      this.data = defaults;
    } else {
      this.data = { ...this.data, [key]: defaults[key] };
    }
    this.dirty = true;
    await this.save();
    return this;
  }

  async destroy(): Promise<this> {
    await this.ledger.vault.driver.delete(this.ledger.name, this.id);
    this.data = this.ledger.blueprint.defaults() as T;
    this.status = RecordStatus.NotExists;
    this.dirty = false;
    this.ledger.cache.delete(this.id);
    this.ledger.vault.emit("recordDelete", { ledger: this.ledger.name, id: this.id });
    return this;
  }

  pluck<K extends keyof T>(...keys: K[]): T[K][] {
    return keys.map((k) => this.data[k]);
  }

  isDirty(): boolean {
    return this.dirty;
  }
}

export type { InferBlueprint } from "./blueprint/field.js";
