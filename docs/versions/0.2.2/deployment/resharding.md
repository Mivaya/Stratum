# Sharding & resharding

`@stambha/gateway` includes capacity planning, identify rate limiting, and operator APIs for production sharding.

## Shard calculator

```ts
import {
  recommendedShardCount,
  guildShardId,
  shardCapacityRatio,
  guildsAffectedByReshard,
} from "@stambha/gateway";

recommendedShardCount(2500); // 3
shardCapacityRatio(2500, 2); // ~1.25 (over 1000 guilds/shard cap)

guildsAffectedByReshard(2, 4, ["100000000000000001"]);
```

## Automated resharding (threshold)

```ts
import { evaluateReshard } from "@stambha/gateway";

const evaluation = evaluateReshard(2500, 2, {
  guildsPerShard: 1000,
  scaleUpThreshold: 0.8,   // scale up at 80% capacity
  scaleDownThreshold: 0.3, // scale down below 30%
});

if (evaluation.needed && evaluation.reason === "scale_up") {
  console.log(`Reshard to ${evaluation.recommendedShards} shards`);
}
```

## Identify budget

Discord limits identify frequency (~1 per 5 seconds per bot token). `IdentifyBudget` queues identify starts:

```ts
import { createIdentifyBudget } from "@stambha/gateway";

const budget = createIdentifyBudget({ minIntervalMs: 5500, maxConcurrent: 1 });

await budget.acquire();
try {
  // send gateway identify (opcode 2)
} finally {
  budget.release();
}
```

## Reshard controller

Plan migration, stagger identifies, then resize the shard manager:

```ts
import { createShardManager, createReshardController } from "@stambha/gateway";

const manager = createShardManager({ totalShards: 2 });
const controller = createReshardController({
  manager,
  getGuildIds: () => myGuildIdList,
});

const auto = controller.evaluate(2500);
if (auto.needed) {
  controller.planManual(auto.recommendedShards);
  controller.start();

  let shardId: number | null;
  while ((shardId = await controller.nextIdentify()) !== null) {
    // identify shardId with new total from controller.plan!.toTotal
    controller.markIdentifyComplete(shardId, { sessionId: "...", sequence: 0 });
  }

  controller.complete(); // manager.totalShards updated
}
```

## Manual resharding HTTP API

```ts
import { createReshardServer, createReshardController, createShardManager } from "@stambha/gateway";

const server = await createReshardServer({
  port: 5100,
  secret: process.env.RESHARD_SECRET,
  controller: createReshardController({ manager: createShardManager({ totalShards: 2 }) }),
});
```

| Method | Path | Body | Purpose |
|--------|------|------|---------|
| GET | `/health` | — | Liveness |
| GET | `/v1/reshard/status` | — | Current phase + plan |
| POST | `/v1/reshard/evaluate` | `{ guildCount }` | Threshold check |
| POST | `/v1/reshard/plan` | `{ targetShards }` | Build plan |
| POST | `/v1/reshard/start` | `{ targetShards? }` | Begin identify phase |
| POST | `/v1/reshard/complete` | — | Apply new shard count |

Bearer auth when `secret` is set (same pattern as REST/worker servers).

## Zero-downtime notes

The APIs below provide **planning and pacing** primitives. A full zero-downtime migration also requires:

1. Re-identify every shard with the new `[shardId, newTotal]` pair
2. Drain guilds that changed shard assignment (see `guildsToMigrate` on `ReshardPlan`)
3. Respect `IdentifyBudget` across all gateway workers sharing one bot token

A bundled native WebSocket gateway client will integrate these primitives with live shard connections.

## Related

- [Gateway](/deployment/gateway) — shard manager, worker bus
- [Tier split](/deployment/tier-split) — multi-process layout