# Chron (scheduled tasks)

Chron pieces are Klasa-style **scheduled tasks** — background jobs that run on an interval or cron expression.

## Layout

Place tasks in `src/tasks/` (see `PiecePaths.tasks`).

## Define a task

```ts
import { Chron, type ChronContext, type Registry } from "@stambha/core";

export class HeartbeatTask extends Chron {
  constructor(registry: Registry<Chron>) {
    super(registry, {
      name: "heartbeat",
      schedule: { every: 60_000 }, // ms
      runOnStart: true,
    });
  }

  async run(ctx: ChronContext): Promise<void> {
    console.info(`[${ctx.chron}] tick at ${ctx.runAt.toISOString()}`);
  }
}
```

### Cron schedule

```ts
schedule: { cron: "0 */6 * * *" } // every 6 hours (5-field cron)
```

## Lifecycle

- Tasks start when `client.start()` runs (after the bridge connects).
- Tasks stop when `client.stop()` runs.
- Overlapping runs are skipped unless `concurrent: true`.
- Errors emit `chronError` on the client.

## Loader

```ts
await loadPieces(client, { context: { client, vault } });
// loads src/tasks/*.ts into client.registries.chrons
```