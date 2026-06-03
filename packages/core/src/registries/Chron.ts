import { Unit, type UnitOptions } from "../pieces/Unit.js";
import { Registry } from "../pieces/Registry.js";
import type { ChronContext } from "../context/types.js";

/** Interval in milliseconds or a standard 5-field cron expression. */
export type ChronSchedule = { every: number } | { cron: string };

export interface ChronOptions extends UnitOptions {
  schedule: ChronSchedule;
  /** Run once when the scheduler starts (default false). */
  runOnStart?: boolean;
  /** Allow overlapping runs (default false — skip tick if still running). */
  concurrent?: boolean;
}

/**
 * Scheduled background work (Klasa `Task` / cron jobs).
 * Lives in `src/tasks/` and is loaded by `@stambha/loader`.
 */
export abstract class Chron extends Unit<ChronOptions> {
  readonly schedule: ChronSchedule;
  readonly runOnStart: boolean;
  readonly concurrent: boolean;
  private running = false;

  constructor(registry: Registry<Chron>, options: ChronOptions) {
    super(registry, options);
    this.schedule = options.schedule;
    this.runOnStart = options.runOnStart ?? false;
    this.concurrent = options.concurrent ?? false;
  }

  abstract run(ctx: ChronContext): Promise<void> | void;

  /** Invoked by {@link ChronScheduler} on each tick. */
  async execute(): Promise<void> {
    if (!this.enabled) return;
    if (!this.concurrent && this.running) return;

    this.running = true;
    try {
      const ctx: ChronContext = {
        chron: this.name,
        client: this.client,
        runAt: new Date(),
      };
      await this.run(ctx);
    } finally {
      this.running = false;
    }
  }
}
