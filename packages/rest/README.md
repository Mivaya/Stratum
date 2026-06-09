# @stambha/rest

**Native Discord REST client** — centralized rate-limit queue, split-tier REST worker, and slash command deploy. No discord.js in the REST process.

Part of the [**@stambha**](https://www.npmjs.com/org/stambha) monorepo · [GitHub](https://github.com/mivaya/Stambha) · [Tier split docs](https://github.com/mivaya/Stambha/tree/main/docs/deployment/tier-split.md)

---

## Install

```bash
npm install @stambha/rest @stambha/core @stambha/transport
```

Requires **Node.js 20+**.

---

## Quick start

### In-process REST (monolith)

```ts
import { createStambhaBot } from "@stambha/core";
import { createNativeRestPort } from "@stambha/rest";

const token = process.env.DISCORD_TOKEN!;

const client = createStambhaBot({
  restPort: createNativeRestPort(token),
});
```

Commands call `ctx.reply()` through the shared `RestPort` — rate limits are handled globally.

### Standalone REST worker (tier split)

```ts
import { createNativeRestWorker } from "@stambha/rest";

const { url, close } = await createNativeRestWorker({
  token: process.env.DISCORD_TOKEN!,
  port: 4000,
});

console.log(`REST worker listening at ${url}`);
```

Point the bot worker at it with `HttpRestPort` from `@stambha/core` (`REST_WORKER_URL` in `examples/bot`).

### Deploy slash commands

```ts
import { deployCommands } from "@stambha/rest";

const result = await deployCommands({
  token: process.env.DISCORD_TOKEN!,
  applicationId: process.env.DISCORD_CLIENT_ID!,
  guildId: process.env.DISCORD_GUILD_ID, // omit for global deploy
  commands: client.registries.commands.values(),
});

console.log(`Deployed ${result.count} command(s)`);
```

---

## Key exports

| Export | Purpose |
|--------|---------|
| `createNativeRestPort` | `RestPort` for in-process REST |
| `RestClient`, `createRestClient` | Low-level Discord API client |
| `RateLimitQueue` | Per-route bucket queue |
| `createNativeRestWorker` | HTTP REST worker process |
| `deployCommands` | Register application commands |
| `createRestTelemetryListener` | Hook metrics into the queue |

---

## Related packages

| Package | Role |
|---------|------|
| [`@stambha/core`](../core) | `RestPort`, `HttpRestPort`, command contexts |
| [`@stambha/transport`](../transport) | API version, session, route keys |
| [`@stambha/metrics`](../metrics) | Prometheus REST telemetry |

---

## Development

```bash
pnpm --filter @stambha/rest build
pnpm --filter @stambha/rest test
```
