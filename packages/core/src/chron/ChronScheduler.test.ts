import { describe, expect, it, vi } from "vitest";
import { ChronScheduler } from "./ChronScheduler.js";
import { Chron, type ChronOptions } from "../registries/Chron.js";
import { Registry } from "../pieces/Registry.js";
import { StratumClient } from "../client/StratumClient.js";
import type { ChronContext } from "../context/types.js";

class TestChron extends Chron {
  runs = 0;

  constructor(registry: Registry<Chron>, options: ChronOptions) {
    super(registry, options);
  }

  async run(_ctx: ChronContext): Promise<void> {
    this.runs += 1;
  }
}

describe("ChronScheduler", () => {
  it("fires interval chrons", async () => {
    const client = new StratumClient();
    const registry = client.registries.chrons;
    const chron = new TestChron(registry, { name: "tick", schedule: { every: 30 } });
    const scheduler = new ChronScheduler();

    scheduler.start([chron]);
    await vi.waitFor(() => expect(chron.runs).toBeGreaterThanOrEqual(2), { timeout: 200 });
    scheduler.stop();
  });

  it("skips overlapping runs when concurrent is false", async () => {
    const client = new StratumClient();
    const registry = client.registries.chrons;
    let active = 0;
    let maxActive = 0;

    class SlowChron extends Chron {
      runs = 0;
      constructor() {
        super(registry, { name: "slow", schedule: { every: 10 }, concurrent: false });
      }
      async run(): Promise<void> {
        this.runs += 1;
        active += 1;
        maxActive = Math.max(maxActive, active);
        await new Promise((r) => setTimeout(r, 50));
        active -= 1;
      }
    }

    const chron = new SlowChron();
    const scheduler = new ChronScheduler();
    scheduler.start([chron]);
    await new Promise((r) => setTimeout(r, 120));
    scheduler.stop();

    expect(maxActive).toBe(1);
    expect(chron.runs).toBeLessThanOrEqual(3);
  });
});
