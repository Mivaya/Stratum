# @stambha/gateway

**Native gateway layer** — shard manager, identify/resume payloads, resharding, worker bus, and `GatewayEventHub` for routing Discord events into Stambha.

Part of the [**@stambha**](https://www.npmjs.com/org/stambha) monorepo · [GitHub](https://github.com/mivaya/Stambha) · [Gateway deployment](https://github.com/mivaya/Stambha/tree/main/docs/deployment/gateway.md)

---

## Install

```bash
npm install @stambha/gateway @stambha/core @stambha/transform @stambha/transport
```

Requires **Node.js 20+**.

---

## Quick start

```ts
import { createStambhaBot } from "@stambha/core";
import { attachStambhaClient, createGatewayEventHub } from "@stambha/gateway";
import { createNativeRestPort } from "@stambha/rest";

const client = createStambhaBot({
  restPort: createNativeRestPort(process.env.DISCORD_TOKEN!),
});

const hub = createGatewayEventHub();
attachStambhaClient(hub, client, {
  // resolvePrefix: async ({ guildId }) => fetchPrefix(guildId) ?? "!",
});
client.setBridge(hub);

hub.markReady({ user: { id: "YOUR_BOT_USER_ID" } });
await client.start();

// Your WebSocket shard worker feeds normalized events:
hub.emit("messageCreate", {
  id: "…",
  content: "!ping",
  channelId: "…",
  guildId: "…",
  author: { id: "…", bot: false },
});
```

Use types from `@stambha/transform` (`StambhaMessage`, etc.) for payloads.

---

## Sharding & resharding

```ts
import {
  createShardManager,
  recommendedShardCount,
  createReshardController,
  GatewayIntent,
  combineIntents,
} from "@stambha/gateway";

const intents = combineIntents(GatewayIntent.Guilds, GatewayIntent.GuildMessages);
const shards = recommendedShardCount(guildCount);
const manager = createShardManager({ token, intents, shards });
```

See `examples/bot` (`pnpm split:gateway`) for a full tier-split relay.

---

## Key exports

| Export | Purpose |
|--------|---------|
| `createGatewayEventHub`, `GatewayEventHub` | Event bus → Stambha client |
| `attachStambhaClient` | Wire hub to `InboundRouter` |
| `ShardManager`, `createShardManager` | Shard lifecycle |
| `buildIdentifyPayload`, `buildResumePayload` | Gateway session payloads |
| `GatewayIntent`, `combineIntents` | Intent bitfields |
| `WorkerBus`, `HttpWorkerClient` | Gateway ↔ bot IPC |
| `ReshardController`, `evaluateReshard` | Resharding policy |

---

## Related packages

| Package | Role |
|---------|------|
| [`@stambha/core`](../core) | Client, pipeline, `Bridge` |
| [`@stambha/transform`](../transform) | Slim event shapes |
| [`@stambha/rest`](../rest) | Outbound replies |

---

## Development

```bash
pnpm --filter @stambha/gateway build
pnpm --filter @stambha/gateway test
```
