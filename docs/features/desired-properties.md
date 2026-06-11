# Desired properties & transforms

**Context slimming** on `StambhaClient` and **`@stambha/transform`** provide a bidirectional layer between Discord transports and Stambha's transport-agnostic shapes.

Inspired by [Discordeno desired properties](https://discordeno.deno.dev/) (gateway RAM trimming) and Stambha's own `CommandContext` field mask.

---

## Client configuration

```ts
import { createStambhaBot, gatesDesiredProperties, minimalDesiredProperties } from "@stambha/core";

// Default: full context + meta (discord.js bots)
const full = createStambhaBot({ prefix: "!" });

// Drop raw Discord objects; keep gate metadata
const gated = createStambhaBot({ desiredProperties: gatesDesiredProperties });

// Minimal RAM — routing fields only
const slim = createStambhaBot({ desiredProperties: minimalDesiredProperties });
```

`client.desiredProperties` is a frozen {@link ResolvedDesiredProperties} mask. Bridges read it when building {@link CommandContext}.

### Presets

| Preset | `raw` | `meta` | Use case |
|--------|-------|--------|----------|
| `defaultDesiredProperties` | yes | full | Development, discord.js |
| `gatesDesiredProperties` | no | full | Production with `@stambha/gates` |
| `minimalDesiredProperties` | no | none | High-scale bots, custom gates |

### Custom mask

```ts
createStambhaBot({
  desiredProperties: {
    context: { meta: true, raw: false, argsText: true, slashOptions: true, slashPath: true },
    meta: { channelType: true, memberPermissions: true, channelNsfw: false, clientPermissions: false },
  },
});
```

---

## `@stambha/transform`

Transport adapters live in one package:

```ts
import {
  messageFromDiscordJs,
  metaFromDiscordJsSlash,
  buildDiscordenoDesiredProperties,
  interactionReplyBody,
} from "@stambha/transform";
```

| Export | Role |
|--------|------|
| `StambhaMessage`, `StambhaUser`, … | Slim internal DTOs |
| `metaFromDiscordJs*` / `metaFromDiscordeno*` | Gate metadata |
| `buildDiscordenoDesiredProperties` | Gateway trim from client mask |
| `interactionReplyBody`, `channelMessageBody` | Native REST payloads |

`@stambha/transform` applies slimming when building contexts. Bot authors usually set `desiredProperties` on the client.

### Discordeno shape helpers

`buildDiscordenoDesiredProperties()` in `@stambha/transform` maps Stambha gate needs to Discordeno-style desired property flags when your gateway worker still uses Discordeno types.

---

## API helpers (core)

```ts
import { slimCommandContext, slimMeta, resolveDesiredProperties } from "@stambha/core";
```

Used by `@stambha/transform` after building a full context. Custom gateway workers should follow the same pattern.

---

## Related

- [Gates](/features/gates) — requires `meta` for permission / NSFW / RunIn checks
- [Transport](/reference/transport) — native REST (uses transform REST bodies in split tier)
