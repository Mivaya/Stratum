# Built-in gates (`@stratum/gates`)

Phase 11 — Sapphire-style **preconditions** as Stratum **gates**. Use on individual commands or register globally.

## Installation

```bash
pnpm add @stratum/gates
```

Requires `@stratum/core`. Transport bridges populate `CommandContext.meta` for permission and channel checks.

## Quick start

```ts
import { Command, ok, type CommandContext, type Registry } from "@stratum/core";
import {
  attachGateDeniedReply,
  cooldownGate,
  guildOnlyGate,
  Permission,
  userPermissionsGate,
} from "@stratum/gates";

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
import { Permission, combinePermissions } from "@stratum/gates";

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

Bridges attach `CommandContext.meta`:

| Field | Used by |
|-------|---------|
| `channelType` | `runInGate`, `guildOnlyGate` |
| `channelNsfw` | `nsfwGate` |
| `memberPermissions` | `userPermissionsGate` |
| `clientPermissions` | `clientPermissionsGate` |

When metadata is missing, gates allow the command (graceful degradation). For strict checks, combine with `guildOnlyGate()` and ensure the bridge populates fields.

### discord.js

`@stratum/bridge-discordjs` fills meta from `Message` and `ChatInputCommandInteraction` automatically.

### Discordeno

`@stratum/bridge-discordeno` provides best-effort meta; extend `desiredProperties` for richer permission data.

## Global gates

Register on the client registry (runs before command-level gates):

```ts
import { Gate } from "@stratum/core";
import { cooldownGate } from "@stratum/gates";

class GlobalSlowdown extends Gate {
  constructor(registry: Registry<Gate>) {
    super(registry, { name: "global-slowdown", priority: 10 });
  }

  check(ctx: CommandContext) {
    return cooldownGate({ limit: 5, delay: 1000, scope: "global" }).check(ctx);
  }
}

client.registries.gates.register(new GlobalSlowdown(client.registries.gates));
```

Or use inline gates on each command (recommended for permissions).

## Denial UX

```ts
attachGateDeniedReply(client, { ephemeral: true });
```

Listens to `commandDenied` and sends the gate's reason. Prefix commands use `reply()`; slash commands use `replyEphemeral()` by default.

## See also

- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) — `gates/` folder
- [ROADMAP.md](./ROADMAP.md) — Phase 12 (Arguments)
