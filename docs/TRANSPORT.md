# Transport foundation

Phase 15 introduces Stratum-owned Discord transport primitives — independent of discord.js and Discordeno. Bridges remain supported; native transport is the long-term default for new bots.

---

## Packages

| Package | Role |
|---------|------|
| `@stratum/transport` | Session info, route normalization, rate-limit bucket model |
| `@stratum/rest` | Native REST client + centralized queue (Discordeno-inspired) |

Core still defines {@link RestPort} and tier-split HTTP worker protocol in `@stratum/core`. Native REST implements the same `RestPort` surface.

---

## Session

```ts
import { createSession, DISCORD_API_BASE } from "@stratum/transport";

const session = createSession({
  token: process.env.DISCORD_TOKEN!,
  applicationId: "123456789012345678",
});
// session.apiBaseUrl → https://discord.com/api/v10
```

---

## Rate-limit buckets

Discord groups REST routes into buckets. Stratum normalizes routes (snowflakes → `:id`) and tracks bucket state from response headers:

```ts
import { parseRouteKey, RateLimitStore, parseRateLimitHeaders } from "@stratum/transport";

const key = parseRouteKey("/channels/999/messages", "POST");
// key.route === "/channels/:id/messages"

const store = new RateLimitStore();
const waitMs = store.waitMs("bucket-id");
```

`@stratum/rest` wraps this in `RateLimitQueue` — one serialized chain per bucket, automatic 429 retry.

---

## Native REST client

```ts
import { createNativeRestPort } from "@stratum/rest";
import { createRestWorkerServer } from "@stratum/core";

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

Gateway workers keep using `HttpRestPort`; only the REST process swaps from discord.js to `@stratum/rest`.

---

## Bridge deprecation path

| Bot type | Recommendation today | Future |
|----------|---------------------|--------|
| **New bot** | Start with bridges if you need gateway events today; use `@stratum/rest` for split-tier REST worker | `@stratum/gateway` + `@stratum/rest` (Phases 16–18) |
| **Existing discord.js bot** | Keep `@stratum/bridge-discordjs`; migrate REST worker first | Gradual: REST → gateway → remove bridge |
| **Existing Discordeno bot** | Keep `@stratum/bridge-discordeno` | Same gradual path |
| **Tests / minimal** | `MockBridge` + in-memory | Unchanged |

**No breaking changes** — bridges are not deprecated in Phase 15. Native transport grows alongside them until gateway (Phase 18) reaches parity.

### Migration checklist (REST worker only)

1. Replace `createDiscordRestWorker` with `createRestWorkerServer` + `createNativeRestPort`.
2. Keep gateway worker unchanged (`HttpRestPort` URL + secret).
3. Compare rate-limit behavior under load; tune `RateLimitQueue` `maxRetries` if needed.

Example: `examples/tier-split/src/rest-native.ts`

---

## Related

- [TIER_SPLIT.md](./TIER_SPLIT.md) — gateway / REST worker split
- [ROADMAP.md](./ROADMAP.md) — Phases 16–18 (native REST worker, gateway, cache)
