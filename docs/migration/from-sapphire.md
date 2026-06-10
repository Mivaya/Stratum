# Migrating from Sapphire

This guide helps [Sapphire](https://sapphirejs.dev/) bots move to Stambha while keeping familiar folder layout and concepts.

## Why migrate

Sapphire is excellent on **discord.js**. Stambha gives you the same piece model plus:

- **Native transport** — no discord.js dependency; `@stambha/rest` + `@stambha/gateway`
- Tier-split gateway + REST workers
- Vault (schema-driven guild/user settings)
- Sequences, Chron, and built-in metrics

You do **not** need to rename folders for most Sapphire projects.

---

## Quick mapping

| Sapphire | Stambha | Notes |
|----------|---------|-------|
| `SapphireClient` | `createStambhaBot()` | No CLI required |
| `@sapphire/framework` stores | `client.registries.*` | Commands, listeners, etc. |
| `commands/` | `src/commands/` | Same |
| `listeners/` | `src/listeners/` | Stambha class: `Hook` |
| `preconditions/` | `src/gates/` | Stambha class: `Gate` |
| `@sapphire/plugin-logger` | `@stambha/plugins` | Container + lifecycle hooks |
| `@sapphire/utilities` Result | `ok()` / `err()` from `@stambha/core` | Pipeline outcomes |
| `@sapphire/decorators` | Class-based pieces (same pattern) | No decorator required |
| `@sapphire/plugin-subcommands` | Built-in command tree | See [Command tree](/features/command-tree) |
| `@sapphire/plugin-api` | `@stambha/dashboard` (plugins repo) or BYO HTTP | [ADR 003](/internal/adr/003-plugins-monorepo) — not `@stambha/plugin-api` |
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

**After (Stambha — native stack):**

```ts
import { createStambhaBot } from "@stambha/core";
import { attachStambhaClient, createGatewayEventHub } from "@stambha/gateway";
import { loadPieces } from "@stambha/loader";
import { createNativeRestPort } from "@stambha/rest";

const client = createStambhaBot({
  prefix: "!",
  restPort: createNativeRestPort(process.env.DISCORD_TOKEN!),
});

await loadPieces(client);

const hub = createGatewayEventHub();
attachStambhaClient(hub, client, {
  // Optional per-guild prefix (replaces Sapphire fetchPrefix):
  // resolvePrefix: async ({ guildId }) => fetchGuildPrefix(guildId) ?? "!",
});
client.setBridge(hub);

// Startup order matters:
// 1. markReady — bot user id for routing
// 2. start() — binds hooks, starts Chron, emits client "ready"
// 3. Wire WebSocket shard → hub.emit("messageCreate", stambhaMessage)
hub.markReady({ user: { id: "YOUR_BOT_USER_ID" } });
await client.start();
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

**Stambha:**

```ts
import { Command, ok, type CommandContext, type Registry } from "@stambha/core";

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

Register manually or via `loadPieces`. Slash deploy: `deployCommands` from `@stambha/rest`.

Arguments: use `@stambha/args` — see [Arguments](/features/args).

---

## Listeners → Hooks

| Sapphire | Stambha |
|----------|---------|
| `Listener` | `Hook` |
| `events: [Events.ClientReady]` | `event: "ready"` |
| `once: true` | `once: true` on `Hook` options |

```ts
import { Hook, type Registry } from "@stambha/core";

export class ReadyListener extends Hook {
  constructor(registry: Registry<Hook>) {
    super(registry, { name: "ready", event: "ready", once: true });
  }

  handle(): void {
    console.log("Ready");
  }
}
```

Load from `src/listeners/` with `@stambha/loader`.

---

## Preconditions → Gates

Sapphire **preconditions** map to Stambha **gates** — inline `gates: [...]` or registry pieces referenced by `gateNames: ["mod-only"]` (only listed gates run; use `global: true` on a gate piece for bot-wide checks).

| Sapphire precondition | Stambha |
|-----------------------|---------|
| `Precondition` class | `Gate` class or `@stambha/gates` factory |
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

**Stambha:**

```ts
import { userPermissionsGate, attachGateDeniedReply } from "@stambha/gates";
import { Permission } from "@stambha/gates";

attachGateDeniedReply(client); // optional auto-reply on deny

// On command:
gates: [userPermissionsGate(Permission.BanMembers)]
```

Global gates: register on `client.registries.gates` or use conduits/barriers for pipeline-wide logic. See [Gates](/features/gates).

---

## Plugins

| Sapphire | Stambha |
|----------|---------|
| `@sapphire/plugin-*` | `@stambha/plugins` |
| `container` | `client.container` |
| `preStart`, `postLoad` hooks | `pluginLifecycle` on `createStambhaBot` |

See [Plugins](/features/plugins).

---

## Settings / config

Sapphire bots often mix **plugin-api JSON**, custom SQL tables for `GuildConfig`, and **Prisma** for domain data. Stambha recommends **both**:

| Layer | Tool | Use for |
|-------|------|---------|
| Bot config & flags | **Vault** (`@stambha/vault`) | Prefix, modules, log channels, level overrides |
| Domain data | **Keep Prisma/SQL** | Economy, achievements, mod-log tables at scale, analytics |

Vault does **not** replace your ORM. It replaces ad-hoc guild-config tables and one-off JSON settings. Blueprints live in `src/schemas/`; persistence via `@stambha/vault` + optional `@stambha/vault-sql`.

```ts
await loadPieces(client, { context: { vault, prisma } });
```

Vault is **optional** in early migration (step 8). Add it when moving guild settings off Prisma or custom JSON — not when replacing your entire database layer.

See [Vault](/features/vault).

---

## Migration checklist

1. Replace `SapphireClient` with `createStambhaBot` + native gateway hub.
2. Rename `preconditions/` → `gates/` (or keep path via loader `paths: { gates: "src/preconditions" }`).
3. Convert commands to `Command` + `execute(ctx)` returning `ok()` / `err()`.
4. Convert listeners to `Hook`.
5. Swap precondition classes for `@stambha/gates` factories or custom `Gate` classes.
6. Run `loadPieces(client)` instead of Sapphire's loader.
7. Register slash commands via `deployCommands` from `@stambha/rest`.
8. (Optional) Add Vault; add tier split — see [Tier split](/deployment/tier-split).

## TypeScript / CJS consumers

Stambha packages ship **dual ESM + CJS** builds (`import` / `require`). If you migrate a CommonJS Sapphire bot:

- Set `"moduleResolution": "node16"` or `"bundler"` and `"module": "NodeNext"` in `tsconfig.json`.
- Use `import type { CommandContext } from "@stambha/core"` for type-only imports (required under `verbatimModuleSyntax`).
- Prefer dynamic `import()` for ESM-only tooling, or consume the `require("@stambha/core")` CJS entry.

## Related

- [Project structure](/guide/project-structure)
- [Getting started](/guide/getting-started)
