import { Chron, type ChronContext, type Registry } from "@stratum/core";
import type { StratumClient } from "@stratum/core";

/** Logs a heartbeat every minute (demo Chron task). */
export class HeartbeatTask extends Chron {
  constructor(registry: Registry<Chron>, _client: StratumClient) {
    super(registry, {
      name: "heartbeat",
      schedule: { every: 60_000 },
      runOnStart: true,
    });
  }

  static create(ctx: { client: StratumClient }) {
    return new HeartbeatTask(ctx.client.registries.chrons, ctx.client);
  }

  async run(ctx: ChronContext): Promise<void> {
    console.info(`[chron:${ctx.chron}] heartbeat at ${ctx.runAt.toISOString()}`);
  }
}
