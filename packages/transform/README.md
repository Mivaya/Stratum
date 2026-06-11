# @stambha/transform

**Payload normalization** — convert gateway events into slim Stambha contexts and build REST request bodies. Discordeno-style desired properties for memory-conscious bots.

Part of the [**@stambha**](https://www.npmjs.com/org/stambha) monorepo · [GitHub](https://github.com/mivaya/Stambha)

---

## Install

```bash
npm install @stambha/transform @stambha/core
```

Requires **Node.js 20+**.

---

## Quick start

### Native shapes (recommended)

Define interactions with transport-neutral types:

```ts
import type { StambhaMessage, StambhaSlashInteraction } from "@stambha/transform";

const message: StambhaMessage = {
  id: "1",
  content: "!ping",
  channelId: "c1",
  guildId: "g1",
  author: { id: "u1", bot: false },
};
```

### Build REST bodies

```ts
import { channelMessageBody, interactionReplyBody } from "@stambha/transform";

await restPort.request({
  method: "POST",
  route: `/channels/${channelId}/messages`,
  body: channelMessageBody({ content: "Hello!" }),
});
```

### Split-tier context builders

```ts
import {
  scoutContextFromStambhaMessage,
  commandContextFromStambhaSlashViaRest,
} from "@stambha/transform";
```

---

## Adapters (optional)

Migrating from another library? Use adapters — they are **not** required for the native stack.

| Adapter | Exports |
|---------|---------|
| discord.js | `messageFromDiscordJs`, `slashInteractionFromDiscordJs`, … |
| Discordeno | `messageFromDiscordeno`, `defaultDiscordenoDesiredProperties`, … |

---

## Key exports

| Export | Purpose |
|--------|---------|
| `StambhaMessage`, `StambhaUser`, `StambhaSlashInteraction` | Core shapes |
| `channelMessageBody`, `interactionReplyBody` | REST payloads |
| `scoutContextFromStambhaMessage` | Scout routing |
| `commandContextFromStambhaSlashViaRest` | Command routing via `RestPort` |

---

## Related packages

| Package | Role |
|---------|------|
| [`@stambha/gateway`](../gateway) | Emits `Stambha*` events into the hub |
| [`@stambha/rest`](../rest) | Sends bodies built here |
| [`@stambha/core`](../core) | `DesiredProperties`, slim contexts |

---

## Development

```bash
pnpm --filter @stambha/transform build
pnpm --filter @stambha/transform test
```
