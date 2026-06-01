# Gateway manager & worker protocol

Phase 18 adds `@stratum/gateway` (shard state, identify/resume payloads, gateway↔bot messaging) and `@stratum/cache` (pluggable in-memory cache). Native WebSocket gateway and Redis cache are planned for later phases.

## Shard manager

Track identify / resume state per shard before wiring a real gateway connection:

```ts
import { createShardManager, buildIdentifyPayload, combineIntents, GatewayIntent } from "@stratum/gateway";
import { createSession } from "@stratum/transport";

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

Shard calculator helpers (`recommendedShardCount`, `guildShardId`, `shardIdsForWorker`) live in the same package for Phase 19 resharding.

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

### Relay bridge events

On the gateway process, attach a discord.js (or other) bridge and forward events to the bot worker:

```ts
import { attachGatewayRelay, createHttpWorkerClient } from "@stratum/gateway";
import { createDiscordJsBridge } from "@stratum/bridge-discordjs";

const bus = createHttpWorkerClient({ baseUrl: "http://127.0.0.1:5000", secret: process.env.WORKER_SECRET });
const bridge = createDiscordJsBridge({ token, intents: [...] }); // no StratumClient on gateway

attachGatewayRelay(bridge, { bus, shardId: 0 });
await bridge.connect();
```

Bot worker:

```ts
import { createWorkerServer, WorkerMessageTypes } from "@stratum/gateway";

await createWorkerServer({
  port: 5000,
  secret: process.env.WORKER_SECRET,
  onMessage: async (message) => {
    if (message.type === WorkerMessageTypes.gatewayEvent) {
      const { event, payload } = message.payload as { event: string; payload: unknown };
      // Route into StratumClient (see examples/tier-split-v2)
    }
  },
});
```

HTTP endpoints (parity with REST worker):

- `GET /health`
- `POST /v1/worker` — JSON `WorkerMessage` body

**Note:** HTTP relay carries JSON-serializable payloads. Use in-process `InMemoryWorkerBus` when you need live discord.js class instances, or normalize via `@stratum/transform` for cross-process bots.

## Cache

```ts
import { createMemoryCache } from "@stratum/cache";

const cache = createMemoryCache({ defaultTtlMs: 60_000 });
await cache.set("guild:123", { name: "My Guild" });
const guild = await cache.get<{ name: string }>("guild:123");
```

Redis and gateway-backed cache adapters are planned; the `Cache` interface is stable for custom backends.

## Tier split v2

| Process | Packages | Role |
|---------|----------|------|
| REST worker | `@stratum/rest` | Centralized rate limits |
| Gateway worker | Bridge + `@stratum/gateway` | WebSocket only, relay events |
| Bot worker | `@stratum/core` + bridge context helpers | Commands, vault, sequences |

See [TIER_SPLIT.md](./TIER_SPLIT.md) for REST/gateway v1 and `examples/tier-split-v2` for the three-process layout.

## Related

- [TRANSPORT.md](./TRANSPORT.md) — session info and REST routes
- [ROADMAP.md](./ROADMAP.md) — Phase 19 resharding, native WebSocket gateway
