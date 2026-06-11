# Getting started

This guide walks you through a minimal Stambha bot using the **native stack** (`@stambha/rest`, `@stambha/gateway`, `@stambha/transform`).

## Prerequisites

- Node.js 20 or newer
- A [Discord application](https://discord.com/developers/applications) and bot token

## Install

```bash
pnpm add @stambha/core @stambha/rest @stambha/gateway @stambha/transform @stambha/loader
```

Optional packages: `@stambha/gates`, `@stambha/metrics`. Add `@stambha/vault` when you need typed guild/user/member **config** (prefix, flags, modules) — keep Prisma or SQL for economy and other domain data. See [Vault](/features/vault).

## 1. Create a command

```ts
// src/commands/General/PingCommand.ts
import { Command, ok, type CommandContext, type Registry } from "@stambha/core";

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
import { createStambhaBot } from "@stambha/core";
import { attachStambhaClient, createGatewayEventHub } from "@stambha/gateway";
import { loadPieces } from "@stambha/loader";
import { createNativeRestPort } from "@stambha/rest";

const token = process.env.DISCORD_TOKEN!;
const client = createStambhaBot({
  prefix: "!",
  restPort: createNativeRestPort(token),
});

await loadPieces(client);

const hub = createGatewayEventHub();
attachStambhaClient(hub, client);
client.setBridge(hub);

hub.markReady({ user: { id: process.env.BOT_USER_ID! } });
await client.start();
```

## 3. Connect the gateway

Stambha routes events through a `GatewayEventHub`. Your WebSocket shard worker normalizes Discord payloads and emits them:

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