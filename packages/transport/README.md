# @stambha/transport

**Discord transport primitives** — API constants, bot session info, route keys, and rate-limit bucket helpers. Foundation for `@stambha/rest` and `@stambha/gateway`.

Part of the [**@stambha**](https://www.npmjs.com/org/stambha) monorepo · [GitHub](https://github.com/mivaya/Stambha)

You typically install this as a transitive dependency of `@stambha/rest`. Import directly when building custom transport layers or workers.

---

## Install

```bash
npm install @stambha/transport
```

Requires **Node.js 20+**.

---

## Quick start

```ts
import {
  DISCORD_API_BASE,
  DISCORD_API_VERSION,
  createSession,
  normalizeRoute,
} from "@stambha/transport";

const session = await createSession({ token: process.env.DISCORD_TOKEN! });
console.log(session.userId, session.shardCount);

const route = normalizeRoute("GET", `/channels/${channelId}/messages`);
```

---

## Key exports

| Export | Purpose |
|--------|---------|
| `DISCORD_API_BASE`, `DISCORD_API_VERSION` | API URL constants |
| `createSession`, `SessionInfo` | Bot user + shard metadata |
| `normalizeRoute`, `parseRouteKey` | Rate-limit bucket route keys |
| `RateLimitBucket`, `RateLimitStore` | Bucket state and headers |
| `Snowflake` | ID type alias |

---

## Related packages

| Package | Role |
|---------|------|
| [`@stambha/rest`](../rest) | REST client and queue |
| [`@stambha/gateway`](../gateway) | Shard identify payloads |

---

## Development

```bash
pnpm --filter @stambha/transport build
pnpm --filter @stambha/transport test
```
