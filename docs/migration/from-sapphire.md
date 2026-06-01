# Migrating from Sapphire

This guide helps [Sapphire](https://sapphirejs.dev/) bots move to Stratum while keeping familiar folder layout and concepts.

## Why migrate

Sapphire is excellent on **discord.js**. Stratum gives you the same piece model plus:

- **Native transport** — no discord.js dependency; `@stratum/rest` + `@stratum/gateway`
- Tier-split gateway + REST workers
- Vault (schema-driven guild/user settings)
- Sequences, Chron, and built-in metrics

You do **not** need to rename folders for most Sapphire projects.

---

## Quick mapping

| Sapphire | Stratum | Notes |
|----------|---------|-------|
| `SapphireClient` | `createStratumBot()` | No CLI required |
| `@sapphire/framework` stores | `client.registries.*` | Commands, listeners, etc. |
| `commands/` | `src/commands/` | Same |
| `listeners/` | `src/listeners/` | Stratum class: `Hook` |
| `preconditions/` | `src/gates/` | Stratum class: `Gate` |
| `@sapphire/plugin-logger` | `@stratum/plugins` | Container + lifecycle hooks |
| `@sapphire/utilities` Result | `ok()` / `err()` from `@stratum/core` | Pipeline outcomes |
| `@sapphire/decorators` | Class-based pieces (same pattern) | No decorator required |
| `@sapphire/plugin-subcommands` | Built-in command tree | See [Command tree](/features/command-tree) |
| `@sapphire/plugin-api` | Bring your own HTTP | Not bundled |
| `@sapphire/plugin-hmr` | Not bundled | Use your bundler |

Folder aliases in `PiecePaths`: `preconditions` → `src/gates`.

---

## Bootstrap

**Before (Sapphire):**

```ts
import { SapphireClient } from "@sapphire/framework";

const client = new SapphireClient({ /* intents, etc. */ });
await client.login(token);
```

**After (Stratum — native stack):**

```ts
import { createStratumBot } from "@stratum/core";
import { attachStratumClient, createGatewayEventHub } from "@stratum/gateway";
import { loadPieces } from "@stratum/loader";
import { createNativeRestPort } from "@stratum/rest";

const client = createStratumBot({
  prefix: "!",
  restPort: createNativeRestPort(process.env.DISCORD_TOKEN!),
});

await loadPieces(client);

const hub = createGatewayEventHub();
attachStratumClient(hub, client);
client.setBridge(hub);

hub.markReady({ user: { id: "YOUR_BOT_USER_ID" } });
await client.start();
// Wire your WebSocket shard worker to hub.emit("messageCreate", stratumMessage)
```

---

## Commands

**Sapphire:**

```ts
import { Command } from "@sapphire/framework";

export class PingCommand extends Command {
  constructor(context: Command.Context, options: Command.Options) {
    super(context, { name: "ping", description: "Pong" });
  }
  messageRun(message: Message) {
    return message.channel.send("Pong!");
  }
}
```

**Stratum:**

```ts
import { Command, ok, type CommandContext, type Registry } from "@stratum/core";

export class PingCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "ping",
      description: "Pong",
      kinds: ["slash", "prefix"],
    });
  }

  async execute(ctx: CommandContext) {
    await ctx.reply("Pong!");
    return ok(undefined);
  }
}
```

Register manually or via `loadPieces`. Slash deploy: `deployCommands` from `@stratum/rest`.

Arguments: use `@stratum/args` — see [Arguments](/features/args).

---

## Listeners → Hooks

| Sapphire | Stratum |
|----------|---------|
| `Listener` | `Hook` |
| `events: [Events.ClientReady]` | `event: "ready"` |
| `once: true` | `once: true` on `Hook` options |

```ts
import { Hook, type Registry } from "@stratum/core";

export class ReadyListener extends Hook {
  constructor(registry: Registry<Hook>) {
    super(registry, { name: "ready", event: "ready", once: true });
  }

  handle(): void {
    console.log("Ready");
  }
}
```

Load from `src/listeners/` with `@stratum/loader`.

---

## Preconditions → Gates

Sapphire **preconditions** map to Stratum **gates** (`src/gates/` or per-command `gates: [...]`).

| Sapphire precondition | Stratum |
|-----------------------|---------|
| `Precondition` class | `Gate` class or `@stratum/gates` factory |
| `Cooldown` | `cooldownGate()` |
| `UserPermissions` | `userPermissionsGate()` |
| `ClientPermissions` | `clientPermissionsGate()` |
| `RunIn` | `runInGate()` / `guildOnlyGate()` |
| `NSFW` | `nsfwGate()` |

**Sapphire:**

```ts
export class UserPermissionPrecondition extends Precondition {
  async chatInputRun(interaction, command, context) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) {
      return this.error({ message: "Missing permission" });
    }
    return this.ok();
  }
}
```

**Stratum:**

```ts
import { userPermissionsGate, attachGateDeniedReply } from "@stratum/gates";
import { Permission } from "@stratum/gates";

attachGateDeniedReply(client); // optional auto-reply on deny

// On command:
gates: [userPermissionsGate(Permission.BanMembers)]
```

Global gates: register on `client.registries.gates` or use conduits/barriers for pipeline-wide logic. See [Gates](/features/gates).

---

## Plugins

| Sapphire | Stratum |
|----------|---------|
| `@sapphire/plugin-*` | `@stratum/plugins` |
| `container` | `client.container` |
| `preStart`, `postLoad` hooks | `pluginLifecycle` on `createStratumBot` |

See [Plugins](/features/plugins).

---

## Settings / config

Sapphire often uses `@sapphire/plugin-api` or custom JSON. Stratum **Vault** provides typed guild/user/channel settings:

- Blueprints in `src/schemas/`
- `@stratum/vault` + optional `@stratum/vault-sql`

See [Vault](/features/vault).

---

## Migration checklist

1. Replace `SapphireClient` with `createStratumBot` + native gateway hub.
2. Rename `preconditions/` → `gates/` (or keep path via loader `paths: { gates: "src/preconditions" }`).
3. Convert commands to `Command` + `execute(ctx)` returning `ok()` / `err()`.
4. Convert listeners to `Hook`.
5. Swap precondition classes for `@stratum/gates` factories or custom `Gate` classes.
6. Run `loadPieces(client)` instead of Sapphire's loader.
7. Register slash commands via `deployCommands` from `@stratum/rest`.
8. (Optional) Add Vault; add tier split — see [Tier split](/deployment/tier-split).

## Related

- [Project structure](/guide/project-structure)
- [Getting started](/guide/getting-started)
