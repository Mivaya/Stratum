# @stambha/gates

**Built-in gates** — cooldown, permissions, NSFW, and channel-type checks. Sapphire `@sapphire/plugin-subcommands` preconditions parity without discord.js.

Part of the [**@stambha**](https://www.npmjs.com/org/stambha) monorepo · [GitHub](https://github.com/mivaya/Stambha) · [Gates guide](https://github.com/mivaya/Stambha/tree/main/docs/features/gates.md)

---

## Install

```bash
npm install @stambha/gates @stambha/core
```

Requires **Node.js 20+**.

---

## Quick start

### Attach to a command

```ts
import { Command, ok, type CommandContext, type Registry } from "@stambha/core";
import { cooldownGate, guildOnlyGate } from "@stambha/gates";

export class PingCommand extends Command {
  constructor(registry: Registry<Command>) {
    super(registry, {
      name: "ping",
      description: "Pong!",
      kinds: ["slash"],
      gates: [
        guildOnlyGate(),
        cooldownGate({ limit: 1, delay: 3_000, scope: "user" }),
      ],
    });
  }

  async execute(ctx: CommandContext) {
    await ctx.reply("Pong!");
    return ok(undefined);
  }
}
```

### Auto-reply when a gate denies

```ts
import { attachGateDeniedReply } from "@stambha/gates";

attachGateDeniedReply(client);
```

---

## Available gates

| Gate | Description |
|------|-------------|
| `cooldownGate` | Per-user/channel/global cooldown |
| `permissionsGate` | Member permission flags |
| `userPermissionsGate` / `clientPermissionsGate` | Shorthand permission checks |
| `nsfwGate` | NSFW channel requirement |
| `guildOnlyGate` / `dmOnlyGate` | Channel type restriction |
| `runInGate` / `RunIn` | Run in specific channel types |

Combine custom gates in `@stambha/core` with `gateAnd()` / `gateOr()`.

---

## Key exports

| Export | Purpose |
|--------|---------|
| `cooldownGate`, `MemoryCooldownStore` | Rate-limit commands |
| `permissionsGate`, `Permission` | Discord permission math |
| `nsfwGate` | Age-restricted channels |
| `guildOnlyGate`, `dmOnlyGate`, `runInGate` | Where commands may run |
| `attachGateDeniedReply` | User-facing denial messages |

---

## Related packages

| Package | Role |
|---------|------|
| [`@stambha/core`](../core) | `Gate`, `defineGate`, pipeline |
| [`@stambha/loader`](../loader) | Load custom gates from `src/gates/` |

---

## Development

```bash
pnpm --filter @stambha/gates build
pnpm --filter @stambha/gates test
```
