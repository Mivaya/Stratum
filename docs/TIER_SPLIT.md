# Tier split (REST / gateway workers)

Inspired by [Discordeno’s architecture](https://discordeno.js.org/docs/architecture), Stratum can run **gateway** and **REST** in separate processes. The gateway receives Discord events; outbound API calls go through a dedicated REST worker with isolated rate limits.

## Roles

| Role | Process | Responsibility |
|------|---------|----------------|
| `monolith` | One | Gateway + REST (default) |
| `gateway` | Gateway worker | Events, command routing, replies via `RestPort` |
| `rest` | REST worker | Discord REST API only |

Set `tier: "split"` and `workerRole: "gateway"` on the Stratum client, plus a `restPort` pointing at the REST worker.

## REST worker

```ts
import { createNativeRestWorker } from "@stratum/rest";

const server = await createNativeRestWorker({
  token: process.env.DISCORD_TOKEN!,
  port: 4000,
  secret: process.env.REST_WORKER_SECRET, // optional
});

console.log(`REST worker at ${server.url}`);
```

Legacy discord.js REST worker: `createDiscordRestWorker` from `@stratum/bridge-discordjs` (see `pnpm rest:legacy` in the example).

Endpoints:

- `GET /health` — liveness
- `POST /v1/rest` — execute a {@link RestRequest} (requires bearer token when `secret` is set)

## Gateway worker

```ts
import { createStratumBot, HttpRestPort } from "@stratum/core";
import { createDiscordJsBridge } from "@stratum/bridge-discordjs";

const client = createStratumBot({
  tier: "split",
  workerRole: "gateway",
  restPort: new HttpRestPort({
    baseUrl: "http://127.0.0.1:4000",
    secret: process.env.REST_WORKER_SECRET,
  }),
});

const bridge = createDiscordJsBridge({ token, intents: [...] }, client);
await client.start();
```

Slash and prefix replies are sent through the REST worker instead of the in-process discord.js REST client.

## Example

```bash
# Terminal 1
cd examples/tier-split && pnpm rest

# Terminal 2
cd examples/tier-split && pnpm gateway
```

## Core APIs

| Export | Package | Purpose |
|--------|---------|---------|
| `RestPort`, `RestRequest` | `@stratum/core` | Transport-agnostic REST |
| `HttpRestPort` | `@stratum/core` | Gateway → REST worker client |
| `createRestWorkerServer` | `@stratum/core` | Generic HTTP REST worker |
| `InMemoryTierBus` | `@stratum/core` | In-process event bus (tests / future scale) |
| `createDiscordRestWorker` | `@stratum/bridge-discordjs` | discord.js REST worker (legacy) |
| `createNativeRestWorker` | `@stratum/rest` | Stratum-native REST worker (default) |

`distributed` tier (multiple gateway shards) uses `@stratum/gateway` resharding — see [RESHARDING.md](./RESHARDING.md).

### Tier split v2 (gateway relay + bot worker)

Three processes: REST worker, gateway relay (bridge only), bot worker (StratumClient + `createWorkerServer`).

```bash
# Terminal 1 — REST
cd examples/tier-split-v2 && pnpm rest

# Terminal 2 — bot worker
cd examples/tier-split-v2 && pnpm bot

# Terminal 3 — gateway relay
cd examples/tier-split-v2 && pnpm gateway
```

Single-process demo with `InMemoryWorkerBus`: `pnpm demo` in `examples/tier-split-v2`.

See [GATEWAY.md](./GATEWAY.md) for shard manager, worker messages, and cache.

See [NATIVE_REST.md](./NATIVE_REST.md) for metrics and migration (`pnpm rest` in `examples/tier-split`).
