import { CronExpressionParser } from "cron-parser";
import type { Chron } from "../registries/Chron.js";

type CancelFn = () => void;

export type ChronErrorHandler = (chron: Chron, error: unknown) => void;

export class ChronScheduler {
  private readonly timers = new Map<string, CancelFn>();
  private started = false;

  start(chrons: Iterable<Chron>, onError?: ChronErrorHandler): void {
    if (this.started) return;
    this.started = true;

    for (const chron of chrons) {
      if (!chron.enabled) continue;
      this.schedule(chron, onError);
    }
  }

  stop(): void {
    for (const cancel of this.timers.values()) {
      cancel();
    }
    this.timers.clear();
    this.started = false;
  }

  private schedule(chron: Chron, onError?: ChronErrorHandler): void {
    const tick = (): void => {
      void chron.execute().catch((error) => onError?.(chron, error));
    };

    if (chron.runOnStart) tick();

    const cancel =
      "every" in chron.schedule
        ? this.scheduleInterval(tick, chron.schedule.every, chron.name)
        : this.scheduleCron(tick, chron.schedule.cron);

    this.timers.set(chron.name, cancel);
  }

  private scheduleInterval(tick: () => void, everyMs: number, name: string): CancelFn {
    if (everyMs < 1) {
      throw new Error(`Chron "${name}": interval must be at least 1ms.`);
    }

    const handle = setInterval(tick, everyMs);
    return () => clearInterval(handle);
  }

  private scheduleCron(tick: () => void, expression: string): CancelFn {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const arm = (): void => {
      const next = CronExpressionParser.parse(expression).next();
      const delay = Math.max(0, next.getTime() - Date.now());
      timeout = setTimeout(() => {
        tick();
        arm();
      }, delay);
    };

    arm();

    return () => {
      if (timeout !== undefined) clearTimeout(timeout);
    };
  }
}
