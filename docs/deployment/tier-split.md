# Tier split (REST / gateway / bot workers)

Inspired by [Discordeno’s architecture](https://discordeno.js.org/docs/architecture), Stratum can run **gateway**, **REST**, and **bot logic** in separate processes. The gateway receives Discord events; outbound API calls go through a dedicated REST worker with isolated rate limits; command routing runs in a bot worker.

## Roles

| Role | Process | Responsibility |
|------|---------|----------------|
| `monolith` | One | Gateway + REST (default) |
| `gateway` | Gateway relay | WebSocket shards → normalized events → worker bus |
| `bot` | Bot worker | StratumClient, commands, replies via `RestPort` |
| `rest` | REST worker | Discord REST API only |

Set `tier: "split"` and `workerRole: "gateway"` on the Stratum client when the bot process handles routing, plus a `restPort` pointing at the REST worker.

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

Endpoints:

- `GET /health` — liveness
- `POST /v1/rest` — execute a {@link RestRequest} (requires bearer token when `secret` is set)

## Bot worker

```ts
import { createStratumBot, HttpRestPort } from "@stratum/core";
import { attachStratumClient, createGatewayEventHub } from "@stratum/gateway";

const client = createStratumBot({
  tier: "split",
  workerRole: "gateway",
  restPort: new HttpRestPort({
    baseUrl: "http://127.0.0.1:4000",
    secret: process.env.REST_WORKER_SECRET,
  }),
});

const hub = createGatewayEventHub();
attachStratumClient(hub, client);
client.setBridge(hub);
await client.start();
```

Slash and prefix replies are sent through the REST worker instead of an in-process REST client.

## Gateway relay

Your WebSocket shard code normalizes Discord payloads and feeds the hub:

```ts
import { attachGatewayRelay, createGatewayEventHub, createHttpWorkerClient } from "@stratum/gateway";

const hub = createGatewayEventHub();
attachGatewayRelay(hub, {
  bus: createHttpWorkerClient({ baseUrl: process.env.BOT_WORKER_URL! }),
});

// hub.emit("messageCreate", { id, content, channelId, guildId, author: { id, bot } });
```

## Example: `examples/bot`

Full Sapphire-style layout plus optional split workers in `src/workers/`.

Three processes:

```bash
cd examples/bot && pnpm split:rest    # terminal 1
cd examples/bot && pnpm split:bot     # terminal 2
cd examples/bot && pnpm split:gateway # terminal 3
```

Monolith (all folders):

```bash
cd examples/bot && pnpm demo    # no token — simulates commands
cd examples/bot && pnpm start   # with DISCORD_TOKEN
```

Copy `.env.example` → `.env` before running with a real token.

## Core APIs

| Export | Package | Purpose |
|--------|---------|---------|
| `RestPort`, `RestRequest` | `@stratum/core` | Transport-agnostic REST |
| `HttpRestPort` | `@stratum/core` | Bot → REST worker client |
| `createRestWorkerServer` | `@stratum/core` | Generic HTTP REST worker |
| `InMemoryTierBus` | `@stratum/core` | In-process event bus (tests / demo) |
| `createNativeRestWorker` | `@stratum/rest` | Stratum-native REST worker |
| `createGatewayEventHub`, `attachStratumClient` | `@stratum/gateway` | Native event routing |
| `attachGatewayRelay` | `@stratum/gateway` | Gateway relay → bot worker bus |

`distributed` tier (multiple gateway shards) uses `@stratum/gateway` resharding — see [Resharding](/deployment/resharding).

## See also

- [Gateway](/deployment/gateway) — shard manager, worker messages, cache
- [Native REST](/deployment/native-rest) — metrics and worker options
- [Examples on GitHub](https://github.com/Interittus13/Stratum/tree/main/examples) — runnable samples
