# Migrating from Discordeno

This guide helps [Discordeno](https://discordeno.deno.dev/) “big bot” setups adopt Stambha while keeping operational patterns (split REST, sharding, desired properties).

---

## Mental model

| Discordeno | Stambha |
|------------|---------|
| `createBot()` | `createStambhaBot()` + native transport |
| `@discordeno/gateway` workers | `@stambha/gateway` relay + your WebSocket worker |
| `@discordeno/rest` proxy | `@stambha/rest` + `createNativeRestWorker` |
| Desired properties / transformers | `desiredProperties` + `@stambha/transform` |
| Custom cache | `@stambha/cache` (memory; Redis planned) |
| Shard manager / resharding | `@stambha/gateway` shard + reshard APIs |

Stambha's **native transport** replaces Discordeno library coupling while keeping big-bot topology (split REST, sharding, desired properties).

---

## Minimal bot (native)

```ts
import { createStambhaBot } from "@stambha/core";
import { attachStambhaClient, createGatewayEventHub } from "@stambha/gateway";
import { createNativeRestPort } from "@stambha/rest";

const client = createStambhaBot({
  prefix: "!",
  restPort: createNativeRestPort(process.env.DISCORD_TOKEN!),
});

const hub = createGatewayEventHub();
attachStambhaClient(hub, client);
client.setBridge(hub);

hub.markReady({ user: { id: "YOUR_BOT_USER_ID" } });
await client.start();
```

---

## Big bot → tier layout

| Process | Discordeno | Stambha packages |
|---------|------------|------------------|
| REST worker | REST proxy / `@discordeno/rest` | `@stambha/rest` → `createNativeRestWorker` |
| Gateway | `@discordeno/gateway` | `@stambha/gateway` relay + your WebSocket worker |
| Bot / events | Bot worker handlers | `createStambhaBot` + worker bus consumer |

### Tier split (monolith gateway + REST worker)

```ts
const client = createStambhaBot({
  tier: "split",
  workerRole: "gateway",
  restPort: new HttpRestPort({ baseUrl: "http://127.0.0.1:4000", secret }),
});
```

REST worker:

```ts
import { createNativeRestWorker } from "@stambha/rest";

await createNativeRestWorker({ token, port: 4000, secret });
```

Example: `examples/bot`.

### Tier split (gateway relay + bot worker)

Three processes — see [Tier split](/deployment/tier-split) and `examples/bot` (`pnpm split:rest`, `split:bot`, `split:gateway`):

1. **REST** — `pnpm split:rest`
2. **Bot worker** — `createWorkerServer` + StambhaClient
3. **Gateway relay** — `GatewayEventHub` + `attachGatewayRelay`

---

## Desired properties

Discordeno trims payload memory with desired properties. Stambha exposes the same idea on the client:

```ts
const client = createStambhaBot({
  desiredProperties: {
    context: { meta: true },
    meta: { channelId: true, guildId: true },
  },
});
```

See [Desired properties](/features/desired-properties).

---

## REST migration path

| Step | Action |
|------|--------|
| 1 | Deploy `@stambha/rest` worker alongside existing REST proxy |
| 2 | Point gateway `HttpRestPort` at new worker URL |
| 3 | Compare rate limits / 429 behavior under load |
| 4 | Remove Discordeno REST proxy when stable |

Details: [Native REST](/deployment/native-rest), [Transport](/reference/transport).

---

## Sharding & resharding

Discordeno automates shard workers and resharding. Stambha provides equivalent primitives in `@stambha/gateway`:

```ts
import {
  createShardManager,
  evaluateReshard,
  createReshardController,
  createIdentifyBudget,
} from "@stambha/gateway";

const manager = createShardManager({ totalShards: 4 });
const controller = createReshardController({
  manager,
  budget: createIdentifyBudget({ minIntervalMs: 5500 }),
});

const evaluation = controller.evaluate(guildCount);
if (evaluation.needed) {
  controller.planManual(evaluation.recommendedShards);
  controller.start();
  // loop nextIdentify() + markIdentifyComplete()
  controller.complete();
}
```

See [Resharding](/deployment/resharding).

Native WebSocket gateway wiring is your shard worker calling `hub.emit` — see [Gateway](/deployment/gateway).

---

## Cache

Discordeno custom caches map to `@stambha/cache`:

```ts
import { createMemoryCache } from "@stambha/cache";

const cache = createMemoryCache({ defaultTtlMs: 60_000 });
```

Wire into your guild/user hydration layer; gateway-backed cache adapters are planned.

---

## Cross-runtime

Discordeno often runs on Deno. Stambha core pieces use `@stambha/runtime` for env, fs, and paths:

- **Full bot on Deno**: core + `@stambha/runtime` (HTTP REST/gateway workers Node-only today)
- **Loader / sequences**: runtime-portable

See [Cross-runtime](/deployment/cross-runtime).

---

## Command & interaction code

Discordeno bots usually hand-roll handlers. With Stambha:

- Commands → `Command` class + `@stambha/args`
- Buttons/modals → `Signal` + `stambha:` custom ids
- Multi-step flows → `sequence()` + `client.sequences`

Deploy slash commands: `deployCommands` from `@stambha/rest`.

---

## Migration checklist

1. Create `createStambhaBot` + `createGatewayEventHub` + `attachStambhaClient`.
2. Move handlers into `Command` / `Hook` / `Scout` pieces; use `loadPieces`.
3. Replace REST proxy with `createNativeRestWorker` (keep same HTTP contract).
4. Enable `desiredProperties` to match Discordeno memory profile.
5. (Optional) Split gateway relay + bot worker (tier v2).
6. (Optional) Add reshard controller when guild count grows.
7. Add `@stambha/metrics` for Prometheus parity with custom Discordeno metrics.

---

## Related

- [Gateway](/deployment/gateway)
- [From Sapphire](/migration/from-sapphire) — piece pipeline (gates, args)