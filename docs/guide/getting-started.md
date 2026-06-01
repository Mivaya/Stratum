# Getting started

This guide walks you through a minimal Stratum bot using the **native stack** (`@stratum/rest`, `@stratum/gateway`, `@stratum/transform`).

## Prerequisites

- Node.js 20 or newer
- A [Discord application](https://discord.com/developers/applications) and bot token

## Install

```bash
pnpm add @stratum/core @stratum/rest @stratum/gateway @stratum/transform @stratum/loader
```

Optional packages: `@stratum/gates`, `@stratum/vault`, `@stratum/metrics`.

## 1. Create a command

```ts
// src/commands/General/PingCommand.ts
import { Command, ok, type CommandContext, type Registry } from "@stratum/core";

export class PingCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "ping",
      description: "Replies with Pong!",
      kinds: ["prefix"],
    });
  }

  async execute(ctx: CommandContext) {
    await ctx.reply("Pong!");
    return ok(undefined);
  }
}
```

## 2. Bootstrap the client

```ts
// src/main.ts
import { createStratumBot } from "@stratum/core";
import { attachStratumClient, createGatewayEventHub } from "@stratum/gateway";
import { loadPieces } from "@stratum/loader";
import { createNativeRestPort } from "@stratum/rest";

const token = process.env.DISCORD_TOKEN!;
const client = createStratumBot({
  prefix: "!",
  restPort: createNativeRestPort(token),
});

await loadPieces(client);

const hub = createGatewayEventHub();
attachStratumClient(hub, client);
client.setBridge(hub);

hub.markReady({ user: { id: process.env.BOT_USER_ID! } });
await client.start();
```

## 3. Connect the gateway

Stratum routes events through a `GatewayEventHub`. Your WebSocket shard worker normalizes Discord payloads and emits them:

```ts
hub.emit("messageCreate", {
  id: "…",
  content: "!ping",
  channelId: "…",
  guildId: "…",
  author: { id: "…", bot: false },
});
```

For production, run a dedicated REST worker and split gateway/bot processes — see [Deployment overview](/deployment/overview).

## 4. Run the example

```bash
cd examples/bot
cp .env.example .env   # optional for pnpm demo
pnpm install
pnpm demo              # full folder layout, simulated events
```

## Next steps

- [Project structure](/guide/project-structure) — folder layout (Sapphire-aligned)
- [Pieces & pipeline](/guide/pieces) — commands, hooks, gates, and more
- [Gates](/features/gates) — built-in preconditions
- [Tier split](/deployment/tier-split) — multi-process deployment
