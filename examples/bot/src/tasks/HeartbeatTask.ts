import { Chron, type ChronContext, type Registry } from "@stambha/core";

export class HeartbeatTask extends Chron {
  constructor(registry: Registry<Chron>) {
    super(registry, {
      name: "heartbeat",
      schedule: { every: 60_000 },
      runOnStart: true,
    });
  }

  run(ctx: ChronContext): void {
    console.log(`[task:heartbeat] tick at ${ctx.runAt.toISOString()}`);
  }
}
