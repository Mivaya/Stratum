# Discordeno bridge

Second transport adapter for Stratum using [@discordeno/bot](https://discordeno.js.org/) v21.

## Install

Peer dependency in your bot project:

```bash
pnpm add @stratum/bridge-discordeno @discordeno/bot
```

## Bootstrap

```ts
import { createStratumBot } from "@stratum/core";
import { createDiscordenoBridge } from "@stratum/bridge-discordeno";
import { GatewayIntents } from "@discordeno/bot";

const client = createStratumBot({ prefix: "!" });

const bridge = createDiscordenoBridge(
  {
    token: process.env.DISCORD_TOKEN!,
    intents: GatewayIntents.Guilds | GatewayIntents.GuildMessages | GatewayIntents.MessageContent,
  },
  client,
);

client.setBridge(bridge);
await client.start();
```

## Features

| Feature | Status |
|---------|--------|
| Slash + prefix commands | Yes |
| Scouts (message watchers) | Yes |
| Signals (buttons / modals) | Yes |
| Sequences | Yes (core routing) |
| Slash deploy | `deployCommands({ bot, commands })` |
| Tier split | Use `@stratum/core` `HttpRestPort` (REST worker is discord.js today) |

Discordeno uses **desired properties** — Stratum ships `stratumDesiredProperties` with the fields needed for routing and replies.

## Example

```bash
cd examples/discordeno-bot
pnpm start
```

Deploy slash commands:

```bash
pnpm deploy
```

## vs discord.js bridge

| | `@stratum/bridge-discordjs` | `@stratum/bridge-discordeno` |
|--|-----------------------------|------------------------------|
| Library | discord.js | Discordeno |
| Tier split REST worker | `createDiscordRestWorker` | Planned — use core `RestPort` |
| Multi-step UI | `runSequence()` | Use core `sequence()` + custom render |

Both bridges implement the same Stratum {@link Bridge} interface — your commands, gates, and pipeline code stay unchanged.
