# Gateway manager & worker protocol

`@stambha/gateway` covers shard state, identify/resume payloads, and gateway↔bot messaging. `@stambha/cache` provides a pluggable in-memory cache. A bundled native WebSocket shard client and Redis-backed cache adapters are on the roadmap.

## Shard manager

Track identify / resume state per shard before wiring a real gateway connection:

```ts
import { createShardManager, buildIdentifyPayload, combineIntents, GatewayIntent } from "@stambha/gateway";
import { createSession } from "@stambha/transport";

const manager = createShardManager({ totalShards: 2 });
manager.markIdentifying(0);

const session = createSession({ token: process.env.DISCORD_TOKEN! });
const identify = buildIdentifyPayload({
  session,
  shardId: 0,
  totalShards: 2,
  intents: combineIntents(GatewayIntent.Guilds, GatewayIntent.GuildMessages),
});

manager.markReady(0, { sessionId: "abc", sequence: 1 });
```

Shard calculator helpers (`recommendedShardCount`, `guildShardId`, `shardIdsForWorker`) and resharding (`evaluateReshard`, `ReshardController`) live in the same package — see [RESHARDING.md](./RESHARDING.md).

## Worker protocol

Gateway and bot logic can run in separate processes. Events flow over a **worker bus**:

| Transport | Gateway (publisher) | Bot (consumer) |
|-----------|---------------------|----------------|
| In-process | `InMemoryWorkerBus` | `bus.subscribe(...)` |
| HTTP | `HttpWorkerClient` | `createWorkerServer` |

Message envelope:

```ts
interface WorkerMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: number;
  shardId?: number;
}
```

Built-in types: `gateway:ready`, `gateway:event`, `bot:ping`.

### Relay gateway events

On the gateway process, normalize Discord payloads and forward via `GatewayEventHub` + relay:

```ts
import { attachGatewayRelay, createGatewayEventHub, createHttpWorkerClient } from "@stambha/gateway";

const bus = createHttpWorkerClient({ baseUrl: "http://127.0.0.1:5000", secret: process.env.WORKER_SECRET });
const hub = createGatewayEventHub();
attachGatewayRelay(hub, { bus, shardId: 0 });

// Your WebSocket shard worker:
// hub.emit("messageCreate", { id, content, channelId, guildId, author: { id, bot } });
await hub.connect();
```

Bot worker:

```ts
import { createWorkerServer, WorkerMessageTypes } from "@stambha/gateway";

await createWorkerServer({
  port: 5000,
  secret: process.env.WORKER_SECRET,
  onMessage: async (message) => {
    if (message.type === WorkerMessageTypes.gatewayEvent) {
      const { event, payload } = message.payload as { event: string; payload: unknown };
      // Route into StambhaClient (see examples/bot)
    }
  },
});
```

HTTP endpoints (parity with REST worker):

- `GET /health`
- `POST /v1/worker` — JSON `WorkerMessage` body

**Note:** HTTP relay carries JSON-serializable payloads. Use `@stambha/transform` to normalize library types before `hub.emit`.

## Cache

```ts
import { createMemoryCache } from "@stambha/cache";

const cache = createMemoryCache({ defaultTtlMs: 60_000 });
await cache.set("guild:123", { name: "My Guild" });
const guild = await cache.get<{ name: string }>("guild:123");
```

Redis and gateway-backed cache adapters are planned; the `Cache` interface is stable for custom backends.

## Tier split v2

| Process | Packages | Role |
|---------|----------|------|
| REST worker | `@stambha/rest` | Centralized rate limits |
| Gateway worker | `@stambha/gateway` | WebSocket shards, relay events |
| Bot worker | `@stambha/core` + `@stambha/transform` | Commands, vault, sequences |

See [Tier split](/deployment/tier-split) and `examples/bot` for the three-process layout.

## Related

- [Transport](/reference/transport) — session info and REST routes
- [Cross-runtime](/deployment/cross-runtime) — Node, Bun, Deno support
- [Resharding](/deployment/resharding) — threshold resharding, identify budget, operator API
