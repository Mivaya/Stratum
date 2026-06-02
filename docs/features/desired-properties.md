# Desired properties & transforms

Phase 17 adds **context slimming** on `StratumClient` and **`@stratum/transform`** — a bidirectional layer between Discord transports and Stratum's transport-agnostic shapes.

Inspired by [Discordeno desired properties](https://discordeno.deno.dev/) (gateway RAM trimming) and Stratum's own `CommandContext` field mask.

---

## Client configuration

```ts
import { createStratumBot, gatesDesiredProperties, minimalDesiredProperties } from "@stratum/core";

// Default: full context + meta (discord.js bots)
const full = createStratumBot({ prefix: "!" });

// Drop raw Discord objects; keep gate metadata
const gated = createStratumBot({ desiredProperties: gatesDesiredProperties });

// Minimal RAM — routing fields only
const slim = createStratumBot({ desiredProperties: minimalDesiredProperties });
```

`client.desiredProperties` is a frozen {@link ResolvedDesiredProperties} mask. Bridges read it when building {@link CommandContext}.

### Presets

| Preset | `raw` | `meta` | Use case |
|--------|-------|--------|----------|
| `defaultDesiredProperties` | yes | full | Development, discord.js |
| `gatesDesiredProperties` | no | full | Production with `@stratum/gates` |
| `minimalDesiredProperties` | no | none | High-scale bots, custom gates |

### Custom mask

```ts
createStratumBot({
  desiredProperties: {
    context: { meta: true, raw: false, argsText: true, slashOptions: true, slashPath: true },
    meta: { channelType: true, memberPermissions: true, channelNsfw: false, clientPermissions: false },
  },
});
```

---

## `@stratum/transform`

Transport adapters live in one package:

```ts
import {
  messageFromDiscordJs,
  metaFromDiscordJsSlash,
  buildDiscordenoDesiredProperties,
  interactionReplyBody,
} from "@stratum/transform";
```

| Export | Role |
|--------|------|
| `StratumMessage`, `StratumUser`, … | Slim internal DTOs |
| `metaFromDiscordJs*` / `metaFromDiscordeno*` | Gate metadata |
| `buildDiscordenoDesiredProperties` | Gateway trim from client mask |
| `interactionReplyBody`, `channelMessageBody` | Native REST payloads |

`@stratum/transform` applies slimming when building contexts. Bot authors usually set `desiredProperties` on the client.

### Discordeno shape helpers

`buildDiscordenoDesiredProperties()` in `@stratum/transform` maps Stratum gate needs to Discordeno-style desired property flags when your gateway worker still uses Discordeno types.

---

## API helpers (core)

```ts
import { slimCommandContext, slimMeta, resolveDesiredProperties } from "@stratum/core";
```

Used by `@stratum/transform` after building a full context. Custom gateway workers should follow the same pattern.

---

## Related

- [Gates](/features/gates) — requires `meta` for permission / NSFW / RunIn checks
- [Transport](/reference/transport) — native REST (uses transform REST bodies in split tier)
