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

Bridges call these internally; bot authors usually only set `desiredProperties` on the client.

### Discordeno gateway sync

When you use `createDiscordenoBridge(options, client)`, Stratum merges `client.desiredProperties` into Discordeno's `desiredProperties` (e.g. adds `interaction.member` when permission gates are enabled).

---

## API helpers (core)

```ts
import { slimCommandContext, slimMeta, resolveDesiredProperties } from "@stratum/core";
```

Used by bridges after building a full context. Custom bridges should follow the same pattern.

---

## Related

- [GATES.md](./GATES.md) — requires `meta` for permission / NSFW / RunIn checks
- [BRIDGE_DISCORDENO.md](./BRIDGE_DISCORDENO.md) — Discordeno bridge setup
- [TRANSPORT.md](./TRANSPORT.md) — native REST (uses transform REST bodies in split tier)
