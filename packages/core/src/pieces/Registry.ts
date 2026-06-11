import type { StambhaClient } from "../client/StambhaClient.js";
import type { Unit, UnitOptions } from "./Unit.js";

export type UnitConstructor<T extends Unit = Unit> = new (
  registry: Registry<T>,
  options: UnitOptions & Record<string, unknown>,
) => T;

export class Registry<T extends Unit = Unit> {
  private readonly units = new Map<string, T>();

  constructor(
    readonly client: StambhaClient,
    readonly name: string,
  ) {}

  get size(): number {
    return this.units.size;
  }

  values(): IterableIterator<T> {
    return this.units.values();
  }

  /** Materialize all registered units (Registry is not iterable — use this or spread `values()`). */
  toArray(): T[] {
    return [...this.units.values()];
  }

  get(name: string): T | undefined {
    return this.units.get(name);
  }

  has(name: string): boolean {
    return this.units.has(name);
  }

  register(unit: T): T {
    if (this.units.has(unit.name)) {
      throw new Error(`[${this.name}] Unit "${unit.name}" is already registered.`);
    }
    this.units.set(unit.name, unit);
    this.client.emit("unitRegistered", { registry: this.name, unit });
    return unit;
  }

  unregister(name: string): boolean {
    const removed = this.units.delete(name);
    if (removed) {
      this.client.emit("unitUnregistered", { registry: this.name, name });
    }
    return removed;
  }

  /** Register an already-instantiated unit instance. */
  add(instance: T): T {
    return this.register(instance);
  }

  /** Sorted by priority (lower runs first). Units without priority default to 100. */
  sortedByPriority(getPriority: (unit: T) => number | undefined): T[] {
    return [...this.units.values()]
      .filter((u) => u.enabled)
      .sort((a, b) => (getPriority(a) ?? 100) - (getPriority(b) ?? 100));
  }

  clear(): void {
    this.units.clear();
  }
}
