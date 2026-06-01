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
import { createDiscordRestWorker } from "@stratum/bridge-discordjs";

const server = await createDiscordRestWorker({
  token: process.env.DISCORD_TOKEN!,
  port: 4000,
  secret: process.env.REST_WORKER_SECRET, // optional
});

console.log(`REST worker at ${server.url}`);
```

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
| `createDiscordRestWorker` | `@stratum/bridge-discordjs` | Discord REST worker bootstrap |
| `createNativeRestPort` | `@stratum/rest` | Stratum-native REST (no discord.js) |

`distributed` tier (multiple gateway shards) is reserved for a future phase.

See [TRANSPORT.md](./TRANSPORT.md) for the bridge → native migration path (`pnpm rest:native` in `examples/tier-split`).
