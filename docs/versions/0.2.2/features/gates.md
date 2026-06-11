# Built-in gates (`@stambha/gates`)

Sapphire-style **preconditions** map to Stambha **gates** — inline on commands, via `gateNames`, or `global: true` on gate pieces.

## Installation

```bash
pnpm add @stambha/gates
```

Requires `@stambha/core`. Gateway workers should populate `CommandContext.meta` for permission and channel checks.

## Quick start

```ts
import { Command, ok, type CommandContext, type Registry } from "@stambha/core";
import {
  attachGateDeniedReply,
  cooldownGate,
  guildOnlyGate,
  Permission,
  userPermissionsGate,
} from "@stambha/gates";

// Auto-reply when a gate denies (optional)
attachGateDeniedReply(client);

export class BanCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "ban",
      description: "Ban a member",
      kinds: ["slash"],
      gates: [
        guildOnlyGate(),
        userPermissionsGate(Permission.BanMembers),
        cooldownGate({ limit: 3, delay: 10_000, scope: "userGuild" }),
      ],
    });
  }

  async execute(ctx: CommandContext) {
    await ctx.reply("Banned.");
    return ok(undefined);
  }
}
```

## Available gates

| Gate | Sapphire equivalent | Description |
|------|---------------------|-------------|
| `cooldownGate()` | Cooldown | Rate limit by user / guild / global |
| `permissionsGate()` | UserPermissions + ClientPermissions | Bitfield checks on `meta` |
| `userPermissionsGate()` | UserPermissions | Shorthand member check |
| `clientPermissionsGate()` | ClientPermissions | Shorthand bot check |
| `nsfwGate()` | NSFW | Requires NSFW channel |
| `runInGate()` | RunIn | Channel type allow-list |
| `guildOnlyGate()` | RunIn guild | No DMs |
| `dmOnlyGate()` | RunIn DM | DMs only |

Compose with core helpers: `gateAnd()`, `gateOr()`, `defineGate()`.

## Permission flags

```ts
import { Permission, combinePermissions } from "@stambha/gates";

const mod = combinePermissions(Permission.KickMembers, Permission.BanMembers);
userPermissionsGate(mod);
```

## Cooldown scopes

| Scope | Bucket key |
|-------|------------|
| `user` | user ID |
| `guild` | guild ID |
| `userGuild` | user + guild (default) |
| `global` | entire bot |

Custom store for multi-process bots:

```ts
cooldownGate({ limit: 1, delay: 5000, store: myRedisCooldownStore });
```

## Context metadata

`CommandContext.meta` fields:

| Field | Used by |
|-------|---------|
| `channelType` | `runInGate`, `guildOnlyGate` |
| `channelNsfw` | `nsfwGate` |
| `memberPermissions` | `userPermissionsGate` |
| `clientPermissions` | `clientPermissionsGate` |

When metadata is missing, gates allow the command (graceful degradation). Populate `meta` when building contexts — `@stambha/transform` provides `metaFromDiscordJsMessage` / `metaFromDiscordenoMessage` if your gateway worker still uses those library types.

## Registry gates (`gateNames`)

Gate **pieces** in `src/gates/` register on `client.registries.gates`. They do **not** run on every command automatically — list them on each command (Sapphire preconditions style):

```ts
export class BanCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "ban",
      gateNames: ["mod-only", "global-slowdown"],
      gates: [userPermissionsGate(Permission.BanMembers)],
    });
  }
}
```

Load order: `@stambha/loader` loads `gates/` before `commands/` and validates `gateNames` after `loadPieces()`.

## Global gates

Set `global: true` on a gate piece to run it on **every** command (before `gateNames` and inline gates):

```ts
import { Gate } from "@stambha/core";
import { cooldownGate } from "@stambha/gates";

class GlobalSlowdown extends Gate {
  constructor(registry: Registry<Gate>) {
    super(registry, { name: "global-slowdown", priority: 10, global: true });
  }

  check(ctx: CommandContext) {
    return cooldownGate({ limit: 5, delay: 1000, scope: "global" }).check(ctx);
  }
}

client.registries.gates.register(new GlobalSlowdown(client.registries.gates));
```

Inline `gates: [...]` on each command remains the simplest option for one-off permission checks.

## Denial UX

```ts
attachGateDeniedReply(client, { ephemeral: true });
```

Listens to `commandDenied` and sends the gate's reason. Prefix commands use `reply()`; slash commands use `replyEphemeral()` by default.

## See also

- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) — `gates/` folder
- [Arguments](/features/args) — prefix and slash option parsing