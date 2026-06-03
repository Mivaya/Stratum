# Transport foundation

Phase 15 introduces Stambha-owned Discord transport primitives — independent of discord.js and Discordeno. Bridges remain supported; native transport is the long-term default for new bots.

---

## Packages

| Package | Role |
|---------|------|
| `@stambha/transport` | Session info, route normalization, rate-limit bucket model |
| `@stambha/rest` | Native REST client + centralized queue (Discordeno-inspired) |

Core still defines {@link RestPort} and tier-split HTTP worker protocol in `@stambha/core`. Native REST implements the same `RestPort` surface.

---

## Session

```ts
import { createSession, DISCORD_API_BASE } from "@stambha/transport";

const session = createSession({
  token: process.env.DISCORD_TOKEN!,
  applicationId: "123456789012345678",
});
// session.apiBaseUrl → https://discord.com/api/v10
```

---

## Rate-limit buckets

Discord groups REST routes into buckets. Stambha normalizes routes (snowflakes → `:id`) and tracks bucket state from response headers:

```ts
import { parseRouteKey, RateLimitStore, parseRateLimitHeaders } from "@stambha/transport";

const key = parseRouteKey("/channels/999/messages", "POST");
// key.route === "/channels/:id/messages"

const store = new RateLimitStore();
const waitMs = store.waitMs("bucket-id");
```

`@stambha/rest` wraps this in `RateLimitQueue` — one serialized chain per bucket, automatic 429 retry.

---

## Native REST client

```ts
import { createNativeRestPort } from "@stambha/rest";
import { createRestWorkerServer } from "@stambha/core";

const port = createNativeRestPort(process.env.DISCORD_TOKEN!);

const data = await port.request({
  method: "GET",
  route: "/users/@me",
});

// REST worker (split tier) — drop-in for DiscordRestPort
const server = await createRestWorkerServer({
  port: 4000,
  portImpl: port,
  secret: process.env.REST_WORKER_SECRET,
});
```

Gateway workers keep using `HttpRestPort`; the REST process uses `@stambha/rest`.

---

## Native stack

| Bot type | Stack |
|----------|--------|
| **New bot** | `@stambha/gateway` + `@stambha/rest` + `@stambha/transform` |
| **Split tier** | `createNativeRestWorker` + `HttpRestPort` + gateway relay |
| **Tests / minimal** | `MockBridge` + in-memory |

See [migration overview](/migration/).

### REST worker migration

1. Use `createNativeRestWorker` (or `createRestWorkerServer` + `createNativeRestPort`).
2. Point gateway `HttpRestPort` at the worker URL + secret.
3. Compare rate-limit behavior under load; tune `RateLimitQueue` `maxRetries` if needed.

Example: `examples/bot/src/workers/rest.ts` (`pnpm split:rest`)

---

## Related

- [Tier split](/deployment/tier-split) — gateway / REST worker split
- [Native REST](/deployment/native-rest) — REST worker details
